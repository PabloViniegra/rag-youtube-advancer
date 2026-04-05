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
  code: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errorResponse(
  message: string,
  code: string,
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
    return errorResponse('Authentication required.', 'unauthorized', 401)
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
      'invalid_body',
      400,
    )
  }

  if (!isValidRequest(body)) {
    return errorResponse(
      'Invalid request body. Expected: { videoId: string; transcript: string; title?: string }.',
      'invalid_body',
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
        'store_failed',
        500,
      )
    }

    const row = inserted as { id: string }

    return NextResponse.json({ reportId: row.id, report }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'SEO report generation failed.'
    return errorResponse(message, 'generation_failed', 500)
  }
}
