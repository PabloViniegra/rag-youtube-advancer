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
import { canIndexVideo, resolvePlan } from '@/lib/plans'
import { getVideoCount } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

const EMBED_PROVIDER_ERROR = {
  CUSTOMER_VERIFICATION_REQUIRED: 'customer_verification_required',
} as const

type EmbedProviderErrorType =
  (typeof EMBED_PROVIDER_ERROR)[keyof typeof EMBED_PROVIDER_ERROR]

interface ProviderErrorPayload {
  type?: string
  message?: string
}

interface ProviderErrorData {
  error?: ProviderErrorPayload
}

interface EmbedProviderErrorLike {
  statusCode?: number
  message?: string
  data?: ProviderErrorData
}

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

function extractEmbedProviderError(
  error: unknown,
): EmbedProviderErrorLike | null {
  if (typeof error !== 'object' || error === null) return null
  const value = error as Record<string, unknown>

  const statusCode =
    typeof value.statusCode === 'number' ? value.statusCode : undefined
  const message = typeof value.message === 'string' ? value.message : undefined

  let data: ProviderErrorData | undefined
  const dataRaw = value.data
  if (typeof dataRaw === 'object' && dataRaw !== null) {
    const dataRecord = dataRaw as Record<string, unknown>
    const errorRaw = dataRecord.error
    if (typeof errorRaw === 'object' && errorRaw !== null) {
      const errorRecord = errorRaw as Record<string, unknown>
      data = {
        error: {
          type:
            typeof errorRecord.type === 'string' ? errorRecord.type : undefined,
          message:
            typeof errorRecord.message === 'string'
              ? errorRecord.message
              : undefined,
        },
      }
    }
  }

  if (statusCode === undefined && message === undefined && data === undefined) {
    return null
  }

  return { statusCode, message, data }
}

function resolveProviderFailure(
  error: unknown,
): { status: number; message: string } | null {
  const providerError = extractEmbedProviderError(error)
  if (!providerError) return null

  const providerCause =
    typeof error === 'object' && error !== null
      ? (error as { cause?: unknown }).cause
      : null

  const causeError = extractEmbedProviderError(providerCause)

  const providerType =
    (providerError.data?.error?.type as EmbedProviderErrorType | undefined) ??
    (causeError?.data?.error?.type as EmbedProviderErrorType | undefined)
  const providerMessage =
    providerError.data?.error?.message ?? causeError?.data?.error?.message

  if (
    providerType === EMBED_PROVIDER_ERROR.CUSTOMER_VERIFICATION_REQUIRED ||
    providerMessage?.includes('valid credit card on file') === true
  ) {
    return {
      status: 503,
      message:
        'Vercel AI Gateway billing is not enabled. Add a valid credit card in Vercel AI Gateway and try again.',
    }
  }

  if (providerError.message) {
    return {
      status: providerError.statusCode ?? 502,
      message: `Embedding provider error: ${providerError.message}`,
    }
  }

  if (providerMessage) {
    return {
      status: 502,
      message: `Embedding provider error: ${providerMessage}`,
    }
  }

  return null
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

  // Step 2 — authorization: free users may embed if under their video limit
  const { data: profileData } = await supabase
    .from('profiles')
    .select('role, subscription_active')
    .eq('id', user.id)
    .maybeSingle()

  const profile = profileData as Pick<
    ProfileRow,
    'role' | 'subscription_active'
  > | null
  const plan = profile ? resolvePlan(profile) : 'free'
  const videoCount = await getVideoCount(supabase, user.id)

  if (!canIndexVideo(plan, videoCount)) {
    return errorResponse(
      'Video limit reached. Upgrade to Pro to index more videos.',
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
  } catch (error) {
    const providerFailure = resolveProviderFailure(error)
    if (providerFailure) {
      return errorResponse(
        providerFailure.message,
        EMBED_API_ERROR.INTERNAL_ERROR,
        providerFailure.status,
      )
    }

    return errorResponse(
      'An unexpected error occurred while generating embeddings.',
      EMBED_API_ERROR.INTERNAL_ERROR,
      500,
    )
  }
}
