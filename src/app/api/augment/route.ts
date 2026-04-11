/**
 * POST /api/augment
 *
 * Full RAG Phase 6 — Augmentation endpoint.
 * Retrieves the most relevant video sections for a user query and uses the
 * LLM (via Vercel AI Gateway) to generate a grounded answer.
 *
 * Request body:
 *   { query: string; matchThreshold?: number; matchCount?: number }
 *
 * Success (200):
 *   { answer: string; sources: VideoSectionMatch[]; sourceCount: number }
 *
 * Error responses:
 *   400 — missing / invalid request body
 *   401 — unauthenticated
 *   403 — no active subscription and not admin
 *   404 — no relevant context sections found
 *   500 — unexpected server error
 *
 * Authorization:
 *   The user must have `subscription_active = true` OR `role = 'admin'`
 *   (RLS rule from AGENTS.md §5).
 *
 * Runtime: Node.js (default).
 */
import { NextResponse } from 'next/server'
import { augmentAnswer, augmentAnswerStream } from '@/lib/augmentation/augment'
import type {
  AugmentErrorResponse,
  AugmentRequest,
  AugmentSuccessResponse,
} from '@/lib/augmentation/types'
import { AUGMENT_API_ERROR, AUGMENT_DEFAULTS } from '@/lib/augmentation/types'
import { logger } from '@/lib/logger'
import { retrieveSections } from '@/lib/retrieval/retrieve'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type VideoTitleRow = Pick<
  Database['public']['Tables']['videos']['Row'],
  'id' | 'title'
>

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errorResponse(
  message: string,
  code: AugmentErrorResponse['code'],
  status: number,
): NextResponse<AugmentErrorResponse> {
  return NextResponse.json({ error: message, code }, { status })
}

function sseErrorEvent(
  message: string,
  code: AugmentErrorResponse['code'],
): string {
  return `data: ${JSON.stringify({ type: 'error', error: message, code })}\n\n`
}

function isAugmentRequest(body: unknown): body is AugmentRequest {
  if (typeof body !== 'object' || body === null) return false
  const b = body as Record<string, unknown>

  if (typeof b.query !== 'string' || b.query.trim() === '') return false

  if (b.matchThreshold !== undefined) {
    if (
      typeof b.matchThreshold !== 'number' ||
      b.matchThreshold < 0 ||
      b.matchThreshold > 1
    )
      return false
  }

  if (b.matchCount !== undefined) {
    if (
      typeof b.matchCount !== 'number' ||
      !Number.isInteger(b.matchCount) ||
      b.matchCount < 1
    )
      return false
  }

  return true
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(
  request: Request,
): Promise<NextResponse<AugmentSuccessResponse | AugmentErrorResponse>> {
  const supabase = await createClient()

  // Step 1 — authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return errorResponse(
      'Authentication required.',
      AUGMENT_API_ERROR.UNAUTHORIZED,
      401,
    )
  }

  // Step 2 — authorization: subscription_active OR admin
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as ProfileRow | null
  const isAdmin = profile?.role === 'admin'
  const hasSubscription = profile?.subscription_active === true

  if (!isAdmin && !hasSubscription) {
    return errorResponse(
      'An active subscription is required to use this feature.',
      AUGMENT_API_ERROR.FORBIDDEN,
      403,
    )
  }

  // Step 3 — parse and validate request body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse(
      'Request body must be valid JSON.',
      AUGMENT_API_ERROR.INVALID_BODY,
      400,
    )
  }

  if (!isAugmentRequest(body)) {
    return errorResponse(
      'Invalid request body. Expected: { query: string; matchThreshold?: number; matchCount?: number }.',
      AUGMENT_API_ERROR.INVALID_BODY,
      400,
    )
  }

  // Step 4 — retrieve relevant sections
  try {
    const primaryRetrievalInput = {
      query: body.query,
      userId: user.id,
      matchThreshold: body.matchThreshold ?? AUGMENT_DEFAULTS.matchThreshold,
      matchCount: body.matchCount ?? AUGMENT_DEFAULTS.matchCount,
    }

    let retrieval = await retrieveSections(supabase, primaryRetrievalInput)

    if (retrieval.matches.length === 0) {
      const fallbackThresholds =
        primaryRetrievalInput.matchThreshold > 0 ? [0, -1] : [-1]

      for (const threshold of fallbackThresholds) {
        retrieval = await retrieveSections(supabase, {
          ...primaryRetrievalInput,
          matchThreshold: threshold,
        })

        if (retrieval.matches.length > 0) break
      }
    }

    if (retrieval.matches.length === 0) {
      return errorResponse(
        'No encontré contexto suficiente para esa pregunta. Prueba con otras palabras o menciona una idea concreta del video.',
        AUGMENT_API_ERROR.NO_CONTEXT,
        404,
      )
    }

    // Step 4b — enrich matches with video titles (secondary query, best-effort)
    const uniqueVideoIds = [...new Set(retrieval.matches.map((m) => m.videoId))]
    const { data: videosData } = await supabase
      .from('videos')
      .select('id, title')
      .in('id', uniqueVideoIds)

    const videoTitleMap = new Map(
      ((videosData ?? []) as VideoTitleRow[]).map((v) => [v.id, v.title]),
    )

    const enrichedMatches = retrieval.matches.map((m) => ({
      ...m,
      videoTitle: videoTitleMap.get(m.videoId) ?? null,
    }))

    // Step 5 — augment: inject context and generate answer
    const acceptsSSE = request.headers.get('Accept') === 'text/event-stream'

    if (acceptsSSE) {
      // ── SSE streaming path ──────────────────────────────────────────────────
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of augmentAnswerStream({
              query: body.query,
              matches: enrichedMatches,
            })) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`),
              )
            }
          } catch (streamError) {
            logger.error('augment-sse', 'Stream error:', streamError)
            controller.enqueue(
              encoder.encode(
                sseErrorEvent(
                  'An unexpected error occurred during streaming.',
                  AUGMENT_API_ERROR.INTERNAL_ERROR,
                ),
              ),
            )
          } finally {
            controller.close()
          }
        },
      })

      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      }) as unknown as NextResponse<AugmentSuccessResponse | AugmentErrorResponse>
    }

    // ── JSON path (non-streaming callers) ──────────────────────────────────
    const result = await augmentAnswer({
      query: body.query,
      matches: enrichedMatches,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    logger.error(
      'augment',
      'Unexpected error while generating the answer:',
      error,
    )
    return errorResponse(
      'An unexpected error occurred while generating the answer.',
      AUGMENT_API_ERROR.INTERNAL_ERROR,
      500,
    )
  }
}
