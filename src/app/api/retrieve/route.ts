/**
 * POST /api/retrieve
 *
 * Retrieves the most semantically similar video sections for a user query
 * (RAG Phase 5 — Retrieval).
 *
 * Request body:
 *   { query: string; matchThreshold?: number; matchCount?: number }
 *
 * Success (200):
 *   { matches: VideoSectionMatch[]; count: number }
 *
 * Error responses:
 *   400 — missing/invalid fields in request body
 *   401 — unauthenticated
 *   403 — authenticated but no active subscription or admin role
 *   500 — unexpected server error
 *
 * Authorization:
 *   The user must have `subscription_active = true` OR `role = 'admin'`
 *   in their profile row (RLS read-access rule from AGENTS.md §5).
 *
 * Runtime: Node.js (default — consistent with other /api routes).
 */
import { NextResponse } from 'next/server'
import { retrieveSections } from '@/lib/retrieval/retrieve'
import type {
  RetrieveErrorResponse,
  RetrieveRequest,
  RetrieveSuccessResponse,
} from '@/lib/retrieval/types'
import { RETRIEVE_API_ERROR, RETRIEVE_DEFAULTS } from '@/lib/retrieval/types'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

// ─── helpers ──────────────────────────────────────────────────────────────────

function errorResponse(
  message: string,
  code: RetrieveErrorResponse['code'],
  status: number,
): NextResponse<RetrieveErrorResponse> {
  return NextResponse.json({ error: message, code }, { status })
}

function isRetrieveRequest(body: unknown): body is RetrieveRequest {
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
): Promise<NextResponse<RetrieveSuccessResponse | RetrieveErrorResponse>> {
  const supabase = await createClient()

  // Step 1 — authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return errorResponse(
      'Authentication required.',
      RETRIEVE_API_ERROR.UNAUTHORIZED,
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
      RETRIEVE_API_ERROR.FORBIDDEN,
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
      RETRIEVE_API_ERROR.INVALID_BODY,
      400,
    )
  }

  if (!isRetrieveRequest(body)) {
    return errorResponse(
      'Invalid request body. Expected: { query: string; matchThreshold?: number; matchCount?: number }.',
      RETRIEVE_API_ERROR.INVALID_BODY,
      400,
    )
  }

  // Step 4 — retrieve matching sections
  try {
    const result = await retrieveSections(supabase, {
      query: body.query,
      userId: user.id,
      matchThreshold: body.matchThreshold ?? RETRIEVE_DEFAULTS.matchThreshold,
      matchCount: body.matchCount ?? RETRIEVE_DEFAULTS.matchCount,
    })

    return NextResponse.json(result, { status: 200 })
  } catch {
    return errorResponse(
      'An unexpected error occurred while retrieving video sections.',
      RETRIEVE_API_ERROR.INTERNAL_ERROR,
      500,
    )
  }
}
