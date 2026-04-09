/**
 * POST /api/transcript
 *
 * Extracts the transcript of a YouTube video.
 *
 * Request body:
 *   { url: string; lang?: string }
 *
 * Success (200):
 *   { videoId: string; transcript: TranscriptSegment[]; fullText: string }
 *
 * Error responses:
 *   400 — invalid URL or malformed body
 *   401 — unauthenticated
 *   422 — video unavailable / transcripts disabled / language not found
 *   429 — YouTube rate-limit
 *   500 — unexpected server error
 *
 * Authentication: Supabase session required (enforced by middleware +
 * explicit server-side check for defence in depth).
 *
 * Runtime: Node.js (not Edge) — `youtube-transcript` uses Node built-ins.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  fetchYoutubeTranscript,
  TranscriptFetchError,
} from '@/lib/youtube/transcript'
import type {
  TranscriptErrorResponse,
  TranscriptRequest,
  TranscriptSuccessResponse,
} from '@/lib/youtube/types'
import { TRANSCRIPT_ERROR } from '@/lib/youtube/types'

// ─── helpers ─────────────────────────────────────────────────────────────────

function errorResponse(
  message: string,
  code: TranscriptErrorResponse['code'],
  status: number,
): NextResponse<TranscriptErrorResponse> {
  return NextResponse.json({ error: message, code }, { status })
}

function isTranscriptRequest(body: unknown): body is TranscriptRequest {
  return (
    typeof body === 'object' &&
    body !== null &&
    'url' in body &&
    typeof (body as Record<string, unknown>).url === 'string' &&
    (body as Record<string, unknown>).url !== ''
  )
}

// ─── HTTP status map ──────────────────────────────────────────────────────────

const ERROR_CODE_TO_STATUS: Record<string, number> = {
  [TRANSCRIPT_ERROR.INVALID_URL]: 400,
  [TRANSCRIPT_ERROR.VIDEO_UNAVAILABLE]: 422,
  [TRANSCRIPT_ERROR.TRANSCRIPTS_DISABLED]: 422,
  [TRANSCRIPT_ERROR.TRANSCRIPT_NOT_AVAILABLE]: 422,
  [TRANSCRIPT_ERROR.LANGUAGE_NOT_AVAILABLE]: 422,
  [TRANSCRIPT_ERROR.TOO_MANY_REQUESTS]: 429,
  [TRANSCRIPT_ERROR.FETCH_FAILED]: 502,
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(
  request: Request,
): Promise<NextResponse<TranscriptSuccessResponse | TranscriptErrorResponse>> {
  // Defence-in-depth auth check (middleware already guards /api/transcript)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return errorResponse(
      'Authentication required.',
      TRANSCRIPT_ERROR.UNAUTHORIZED,
      401,
    )
  }

  // Parse JSON body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      {
        error: 'Request body must be valid JSON.',
        code: TRANSCRIPT_ERROR.INVALID_URL,
      },
      { status: 400 },
    )
  }

  if (!isTranscriptRequest(body)) {
    return NextResponse.json(
      {
        error: 'Missing or invalid field "url" (must be a non-empty string).',
        code: TRANSCRIPT_ERROR.INVALID_URL,
      },
      { status: 400 },
    )
  }

  const { url, lang } = body

  try {
    const result = await fetchYoutubeTranscript(url, lang ? { lang } : {})
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    if (error instanceof TranscriptFetchError) {
      const status = ERROR_CODE_TO_STATUS[error.code] ?? 500
      return errorResponse(error.message, error.code, status)
    }

    return NextResponse.json(
      {
        error: 'An unexpected error occurred.',
        code: TRANSCRIPT_ERROR.FETCH_FAILED,
      },
      { status: 500 },
    )
  }
}
