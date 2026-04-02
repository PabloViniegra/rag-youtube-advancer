/**
 * POST /api/store
 *
 * Persists a video and its embedded sections to Supabase (RAG Phase 4 — Storage).
 *
 * Request body:
 *   { youtubeId: string; title: string; sections: EmbeddedChunk[] }
 *
 * Success (200):
 *   { videoId: string; count: number }
 *
 * Error responses:
 *   400 — missing/invalid fields in request body
 *   401 — unauthenticated
 *   403 — authenticated but no active subscription or admin role
 *   500 — unexpected server error
 *
 * Authorization:
 *   The user must have `subscription_active = true` OR `role = 'admin'`
 *   in their profile row (RLS write-access rule from AGENTS.md §5).
 *
 * Runtime: Node.js (default — consistent with other /api routes).
 */
import { NextResponse } from 'next/server'
import type { EmbeddedChunk } from '@/lib/ai/types'
import { storeVideoSections } from '@/lib/storage/store'
import type {
  StoreErrorResponse,
  StoreRequest,
  StoreSuccessResponse,
} from '@/lib/storage/types'
import { STORE_API_ERROR } from '@/lib/storage/types'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

// ─── helpers ──────────────────────────────────────────────────────────────────

function errorResponse(
  message: string,
  code: StoreErrorResponse['code'],
  status: number,
): NextResponse<StoreErrorResponse> {
  return NextResponse.json({ error: message, code }, { status })
}

function isEmbeddedChunk(value: unknown): value is EmbeddedChunk {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.content === 'string' &&
    v.content.trim() !== '' &&
    typeof v.index === 'number' &&
    Array.isArray(v.embedding) &&
    v.embedding.length > 0 &&
    (v.embedding as unknown[]).every((n) => typeof n === 'number')
  )
}

function isStoreRequest(body: unknown): body is StoreRequest {
  if (typeof body !== 'object' || body === null) return false
  const b = body as Record<string, unknown>
  return (
    typeof b.youtubeId === 'string' &&
    b.youtubeId.trim() !== '' &&
    typeof b.title === 'string' &&
    b.title.trim() !== '' &&
    Array.isArray(b.sections) &&
    (b.sections as unknown[]).every(isEmbeddedChunk)
  )
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(
  request: Request,
): Promise<NextResponse<StoreSuccessResponse | StoreErrorResponse>> {
  const supabase = await createClient()

  // Step 1 — authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return errorResponse(
      'Authentication required.',
      STORE_API_ERROR.UNAUTHORIZED,
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
      STORE_API_ERROR.FORBIDDEN,
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
      STORE_API_ERROR.INVALID_BODY,
      400,
    )
  }

  if (!isStoreRequest(body)) {
    return errorResponse(
      'Invalid request body. Expected: { youtubeId: string; title: string; sections: EmbeddedChunk[] }.',
      STORE_API_ERROR.INVALID_BODY,
      400,
    )
  }

  // Step 4 — persist to Supabase
  try {
    const result = await storeVideoSections(supabase, {
      youtubeId: body.youtubeId,
      title: body.title,
      userId: user.id,
      sections: body.sections,
    })

    return NextResponse.json(result, { status: 200 })
  } catch {
    return errorResponse(
      'An unexpected error occurred while storing the video sections.',
      STORE_API_ERROR.INTERNAL_ERROR,
      500,
    )
  }
}
