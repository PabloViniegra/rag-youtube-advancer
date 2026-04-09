/**
 * POST /api/generate-seo-report
 *
 * Generates an SEO Report for a video via LLM,
 * then upserts the result into the `seo_reports` table.
 *
 * Request body:
 *   { videoId: string; transcript: string; title?: string }
 *
 * Success (200):
 *   { reportId: string; report: SeoReport }
 *
 * Error responses:
 *   400 — missing/invalid fields
 *   401 — unauthenticated
 *   500 — LLM or storage failure
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { generateSeoReport } from '@/lib/seo/generate'
import type { SeoReport } from '@/lib/seo/types'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type SeoReportRow = Database['public']['Tables']['seo_reports']['Row']
type AppSupabaseClient = SupabaseClient<Database>

// ─── Error codes ──────────────────────────────────────────────────────────────

const GENERATE_SEO_REPORT_ERROR = {
  /** The user is not authenticated. */
  UNAUTHORIZED: 'unauthorized',
  /** The request body is missing required fields or is not valid JSON. */
  INVALID_BODY: 'invalid_body',
  /** The SEO report could not be persisted to the database. */
  STORE_FAILED: 'store_failed',
  /** The LLM generation call failed. */
  GENERATION_FAILED: 'generation_failed',
} as const

type GenerateSeoReportErrorCode =
  (typeof GENERATE_SEO_REPORT_ERROR)[keyof typeof GENERATE_SEO_REPORT_ERROR]

// ─── Request/Response types ───────────────────────────────────────────────────

interface GenerateSeoReportRequest {
  videoId: string
  transcript: string
  title?: string
}

interface GenerateSeoReportSuccess {
  reportId: string
  report: SeoReport
}

interface GenerateSeoReportError {
  error: string
  code: GenerateSeoReportErrorCode
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errorResponse(
  message: string,
  code: GenerateSeoReportErrorCode,
  status: number,
): NextResponse<GenerateSeoReportError> {
  return NextResponse.json({ error: message, code }, { status })
}

function isValidRequest(body: unknown): body is GenerateSeoReportRequest {
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
): Promise<NextResponse<GenerateSeoReportSuccess | GenerateSeoReportError>> {
  const supabase = await createClient()

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return errorResponse(
      'Authentication required.',
      GENERATE_SEO_REPORT_ERROR.UNAUTHORIZED,
      401,
    )
  }

  // Phase 6 runs after the video is already stored within limits —
  // no additional subscription check needed here. Auth is sufficient.

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse(
      'Request body must be valid JSON.',
      GENERATE_SEO_REPORT_ERROR.INVALID_BODY,
      400,
    )
  }

  if (!isValidRequest(body)) {
    return errorResponse(
      'Invalid request body. Expected: { videoId: string; transcript: string; title?: string }.',
      GENERATE_SEO_REPORT_ERROR.INVALID_BODY,
      400,
    )
  }

  // Generate the SEO report
  try {
    const report = await generateSeoReport({
      transcript: body.transcript,
      title: body.title,
    })

    // Upsert into seo_reports (replace if re-indexing)
    // Cast needed: supabase-js v2 resolves Insert as `never` for JSONB columns
    const { data: inserted, error: insertError } = await (
      supabase.from('seo_reports') as ReturnType<AppSupabaseClient['from']>
    )
      .upsert(
        {
          video_id: body.videoId,
          report,
          generated_at: report.generatedAt,
        } as unknown as SeoReportRow,
        { onConflict: 'video_id' },
      )
      .select('id')
      .single()

    if (insertError || !inserted) {
      return errorResponse(
        insertError?.message ?? 'Failed to store SEO report.',
        GENERATE_SEO_REPORT_ERROR.STORE_FAILED,
        500,
      )
    }

    const row = inserted as { id: string }

    return NextResponse.json({ reportId: row.id, report }, { status: 200 })
  } catch (error) {
    console.error('[generate-seo-report] Unexpected error:', error)
    const message =
      error instanceof Error ? error.message : 'SEO report generation failed.'
    return errorResponse(
      message,
      GENERATE_SEO_REPORT_ERROR.GENERATION_FAILED,
      500,
    )
  }
}
