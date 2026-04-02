/**
 * POST /api/chunk
 *
 * Splits plain text into overlapping segments ready for embedding (RAG Phase 2).
 *
 * Request body:
 *   { text: string; config?: { size?: number; overlap?: number } }
 *
 * Success (200):
 *   { chunks: string[]; count: number }
 *
 * Error responses:
 *   400 — missing/empty text, invalid body, invalid config values
 *   401 — unauthenticated
 *   500 — unexpected server error
 *
 * Authentication: Supabase session required (middleware + server-side check).
 *
 * Runtime: Node.js (default — no Edge-incompatible APIs, but keeps runtime
 * consistent with the rest of /api routes).
 */
import { NextResponse } from 'next/server'
import { chunkText } from '@/lib/ai/chunk'
import type {
  ChunkErrorResponse,
  ChunkRequest,
  ChunkSuccessResponse,
} from '@/lib/ai/types'
import { CHUNK_API_ERROR, CHUNK_CONFIG } from '@/lib/ai/types'
import { createClient } from '@/lib/supabase/server'

// ─── helpers ─────────────────────────────────────────────────────────────────

function errorResponse(
  message: string,
  code: ChunkErrorResponse['code'],
  status: number,
): NextResponse<ChunkErrorResponse> {
  return NextResponse.json({ error: message, code }, { status })
}

function isChunkRequest(body: unknown): body is ChunkRequest {
  if (typeof body !== 'object' || body === null) return false
  const record = body as Record<string, unknown>
  return typeof record.text === 'string' && record.text !== ''
}

/**
 * Validates optional config overrides.
 * Returns `null` when valid, or a human-readable error string otherwise.
 */
function validateConfig(
  config: unknown,
): { size: number; overlap: number } | null | string {
  if (config === undefined || config === null) return null

  if (typeof config !== 'object') return 'config must be an object'

  const record = config as Record<string, unknown>

  const size = record.size !== undefined ? record.size : CHUNK_CONFIG.size
  const overlap =
    record.overlap !== undefined ? record.overlap : CHUNK_CONFIG.overlap

  if (!Number.isInteger(size) || (size as number) <= 0) {
    return 'config.size must be a positive integer'
  }
  if (!Number.isInteger(overlap) || (overlap as number) < 0) {
    return 'config.overlap must be a non-negative integer'
  }
  if ((overlap as number) >= (size as number)) {
    return 'config.overlap must be less than config.size'
  }

  return { size: size as number, overlap: overlap as number }
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(
  request: Request,
): Promise<NextResponse<ChunkSuccessResponse | ChunkErrorResponse>> {
  // Defence-in-depth auth check (middleware already guards /api/chunk)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return errorResponse(
      'Authentication required.',
      CHUNK_API_ERROR.INTERNAL_ERROR,
      401,
    )
  }

  // Parse JSON body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse(
      'Request body must be valid JSON.',
      CHUNK_API_ERROR.INVALID_BODY,
      400,
    )
  }

  if (!isChunkRequest(body)) {
    return errorResponse(
      'Missing or invalid field "text" (must be a non-empty string).',
      CHUNK_API_ERROR.MISSING_TEXT,
      400,
    )
  }

  const { text, config: rawConfig } = body

  // Validate optional config
  const configResult = validateConfig(rawConfig)
  if (typeof configResult === 'string') {
    return errorResponse(configResult, CHUNK_API_ERROR.INVALID_CONFIG, 400)
  }

  try {
    const resolvedConfig = configResult !== null ? configResult : CHUNK_CONFIG

    const chunks = chunkText(text, resolvedConfig)
    return NextResponse.json({ chunks, count: chunks.length }, { status: 200 })
  } catch {
    return errorResponse(
      'An unexpected error occurred.',
      CHUNK_API_ERROR.INTERNAL_ERROR,
      500,
    )
  }
}
