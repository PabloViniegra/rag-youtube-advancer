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
 *   403 — no active subscription or admin role
 *   500 — LLM or storage failure
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { generateIntelligenceReport } from '@/lib/intelligence/generate'
import type { IntelligenceReport } from '@/lib/intelligence/types'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ReportRow = Database['public']['Tables']['intelligence_reports']['Row']
type AppSupabaseClient = SupabaseClient<Database>

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
  code: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errorResponse(
  message: string,
  code: string,
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
    return errorResponse('Authentication required.', 'unauthorized', 401)
  }

  // Authorization
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
      'An active subscription is required.',
      'forbidden',
      403,
    )
  }

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
        'store_failed',
        500,
      )
    }

    const row = inserted as { id: string }

    return NextResponse.json({ reportId: row.id, report }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Intelligence report generation failed.'
    return errorResponse(message, 'generation_failed', 500)
  }
}
