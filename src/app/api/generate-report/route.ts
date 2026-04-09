/**
 * POST /api/generate-report
 *
 * Generates an Intelligence Report for a video via 3 parallel LLM calls,
 * then upserts the result into the `intelligence_reports` table.
 *
 * Request body:
 *   { videoId: string; transcript: string; title?: string }
 *
 * Success (200):
 *   { reportId: string; report: IntelligenceReport }
 *
 * Error responses:
 *   400 — missing/invalid fields
 *   401 — unauthenticated
 *   500 — LLM or storage failure
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { generateIntelligenceReport } from '@/lib/intelligence/generate'
import type { IntelligenceReport } from '@/lib/intelligence/types'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type ReportRow = Database['public']['Tables']['intelligence_reports']['Row']
type AppSupabaseClient = SupabaseClient<Database>

// ─── Error codes ──────────────────────────────────────────────────────────────

const GENERATE_REPORT_ERROR = {
  /** The user is not authenticated. */
  UNAUTHORIZED: 'unauthorized',
  /** The request body is missing required fields or is not valid JSON. */
  INVALID_BODY: 'invalid_body',
  /** The intelligence report could not be persisted to the database. */
  STORE_FAILED: 'store_failed',
  /** The LLM generation call failed. */
  GENERATION_FAILED: 'generation_failed',
} as const

type GenerateReportErrorCode =
  (typeof GENERATE_REPORT_ERROR)[keyof typeof GENERATE_REPORT_ERROR]

// ─── Request/Response types ───────────────────────────────────────────────────

interface GenerateReportRequest {
  videoId: string
  transcript: string
  title?: string
}

interface GenerateReportSuccess {
  reportId: string
  report: IntelligenceReport
}

interface GenerateReportError {
  error: string
  code: GenerateReportErrorCode
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errorResponse(
  message: string,
  code: GenerateReportErrorCode,
  status: number,
): NextResponse<GenerateReportError> {
  return NextResponse.json({ error: message, code }, { status })
}

function isValidRequest(body: unknown): body is GenerateReportRequest {
  if (typeof body !== 'object' || body === null) return false
  const b = body as Record<string, unknown>
  return (
    typeof b.videoId === 'string' &&
    b.videoId.trim() !== '' &&
    typeof b.transcript === 'string' &&
    b.transcript.trim() !== ''
  )
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(
  request: Request,
): Promise<NextResponse<GenerateReportSuccess | GenerateReportError>> {
  const supabase = await createClient()

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return errorResponse(
      'Authentication required.',
      GENERATE_REPORT_ERROR.UNAUTHORIZED,
      401,
    )
  }

  // Phase 5 runs after the video is already stored within limits —
  // no additional subscription check needed here. Auth is sufficient.

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse(
      'Request body must be valid JSON.',
      GENERATE_REPORT_ERROR.INVALID_BODY,
      400,
    )
  }

  if (!isValidRequest(body)) {
    return errorResponse(
      'Invalid request body. Expected: { videoId: string; transcript: string; title?: string }.',
      GENERATE_REPORT_ERROR.INVALID_BODY,
      400,
    )
  }

  // Generate the report (3 parallel LLM calls)
  try {
    const report = await generateIntelligenceReport({
      transcript: body.transcript,
      title: body.title,
    })

    // Upsert into intelligence_reports (replace if re-indexing)
    // Cast needed: supabase-js v2 resolves Insert as `never` for JSONB columns
    const { data: inserted, error: insertError } = await (
      supabase.from('intelligence_reports') as ReturnType<
        AppSupabaseClient['from']
      >
    )
      .upsert(
        {
          video_id: body.videoId,
          report,
          generated_at: report.generatedAt,
        } as unknown as ReportRow,
        { onConflict: 'video_id' },
      )
      .select('id')
      .single()

    if (insertError || !inserted) {
      return errorResponse(
        insertError?.message ?? 'Failed to store intelligence report.',
        GENERATE_REPORT_ERROR.STORE_FAILED,
        500,
      )
    }

    const row = inserted as { id: string }

    return NextResponse.json({ reportId: row.id, report }, { status: 200 })
  } catch (error) {
    console.error('[generate-report] Unexpected error:', error)
    const message =
      error instanceof Error
        ? error.message
        : 'Intelligence report generation failed.'
    return errorResponse(message, GENERATE_REPORT_ERROR.GENERATION_FAILED, 500)
  }
}
