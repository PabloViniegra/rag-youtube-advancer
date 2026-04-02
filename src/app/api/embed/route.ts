/**
 * POST /api/embed
 *
 * Converts an ordered array of plain-text segments into EmbeddedChunks
 * with 1536-dimension vectors (RAG Phase 3 — Embedding).
 *
 * Request body:
 *   { chunks: string[] }
 *
 * Success (200):
 *   { data: EmbeddedChunk[]; count: number }
 *
 * Error responses:
 *   400 — missing/empty chunks array or invalid body
 *   401 — unauthenticated
 *   403 — authenticated but no active subscription or admin role
 *   500 — unexpected server error
 *
 * Authorization:
 *   The user must have `subscription_active = true` OR `role = 'admin'`
 *   in their profile row (RLS write-access rule from AGENTS.md §5).
 *
 * Runtime: Node.js (default — keeps runtime consistent across /api routes).
 */
import { NextResponse } from 'next/server'
import { embedChunks } from '@/lib/ai/embed'
import type {
  EmbedErrorResponse,
  EmbedRequest,
  EmbedSuccessResponse,
} from '@/lib/ai/types'
import { EMBED_API_ERROR } from '@/lib/ai/types'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

// ─── helpers ─────────────────────────────────────────────────────────────────

function errorResponse(
  message: string,
  code: EmbedErrorResponse['code'],
  status: number,
): NextResponse<EmbedErrorResponse> {
  return NextResponse.json({ error: message, code }, { status })
}

function isEmbedRequest(body: unknown): body is EmbedRequest {
  if (typeof body !== 'object' || body === null) return false
  const record = body as Record<string, unknown>
  return (
    Array.isArray(record.chunks) &&
    record.chunks.length > 0 &&
    record.chunks.every((c) => typeof c === 'string' && c.trim() !== '')
  )
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(
  request: Request,
): Promise<NextResponse<EmbedSuccessResponse | EmbedErrorResponse>> {
  const supabase = await createClient()

  // Step 1 — authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return errorResponse(
      'Authentication required.',
      EMBED_API_ERROR.UNAUTHORIZED,
      401,
    )
  }

  // Step 2 — authorization: subscription_active OR admin
  // Note: explicit cast to ProfileRow | null because supabase-js type inference
  // resolves data as 'never' in some strict TypeScript configs; our Database
  // type guarantees the actual shape at runtime.
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
      EMBED_API_ERROR.FORBIDDEN,
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
      EMBED_API_ERROR.INVALID_BODY,
      400,
    )
  }

  if (!isEmbedRequest(body)) {
    return errorResponse(
      'Missing or invalid field "chunks" (must be a non-empty array of strings).',
      EMBED_API_ERROR.MISSING_CHUNKS,
      400,
    )
  }

  // Step 4 — generate embeddings
  try {
    const embedded = await embedChunks(body.chunks)
    return NextResponse.json(
      { data: embedded, count: embedded.length },
      { status: 200 },
    )
  } catch {
    return errorResponse(
      'An unexpected error occurred while generating embeddings.',
      EMBED_API_ERROR.INTERNAL_ERROR,
      500,
    )
  }
}
