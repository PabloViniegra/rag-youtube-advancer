'use server'

/**
 * Pipeline orchestrator — Server Action
 *
 * Chains all 6 RAG ingestion phases by calling library functions directly
 * (no internal HTTP round-trips):
 *   1. fetchYoutubeTranscript — extract full transcript
 *   2. chunkText              — split into overlapping segments
 *   3. embedChunks            — convert segments into 1536-dim vectors
 *   4. storeVideoSections     — persist video + sections to Supabase
 *   5. generateIntelligenceReport — required phase, fails the ingestion on error
 *   6. generateSeoReport          — required phase, fails the ingestion on error
 */

import { updateTag } from 'next/cache'

import { chunkText } from '@/lib/ai/chunk'
import { embedChunks } from '@/lib/ai/embed'
import type { EmbeddedChunk } from '@/lib/ai/types'
import { CHUNK_CONFIG } from '@/lib/ai/types'
import { generateIntelligenceReport } from '@/lib/intelligence/generate'
import type { IntelligenceReport } from '@/lib/intelligence/types'
import { logger } from '@/lib/logger'
import { canIndexVideo, resolvePlan } from '@/lib/plans'
import { generateSeoReport } from '@/lib/seo/generate'
import type { SeoReport } from '@/lib/seo/types'
import { storeVideoSections } from '@/lib/storage/store'
import { getVideoCount } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import {
  fetchYoutubeTranscript,
  TranscriptFetchError,
} from '@/lib/youtube/transcript'
import { TRANSCRIPT_ERROR } from '@/lib/youtube/types'
import type {
  IngestError,
  IngestErrorCode,
  IngestInput,
  IngestResult,
} from './types'
import { INGEST_ERROR } from './types'

// ─── DB row types for upserts ─────────────────────────────────────────────────

type Profile = Database['public']['Tables']['profiles']['Row']
type ReportRow = Database['public']['Tables']['intelligence_reports']['Row']
type SeoReportRow = Database['public']['Tables']['seo_reports']['Row']

// ─── helpers ──────────────────────────────────────────────────────────────────

function ingestError(code: IngestErrorCode, message: string): IngestError {
  return { ok: false, code, message }
}

async function rollbackStoredVideo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  videoId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', videoId)
    .eq('user_id', userId)

  if (error) {
    logger.warn(
      'ingest',
      `Failed to rollback video ${videoId} after report generation failure.`,
      error,
    )
  }
}

// ─── Server Action ────────────────────────────────────────────────────────────

export async function ingestVideo(input: IngestInput): Promise<IngestResult> {
  const { youtubeUrl, title } = input

  // ── Pre-flight: auth + plan gate ────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return ingestError(INGEST_ERROR.UNAUTHORIZED, 'No authenticated user.')
  }

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('role, subscription_active, trial_used')
    .eq('id', user.id)
    .maybeSingle()

  const profile = profileRaw as unknown as Pick<
    Profile,
    'role' | 'subscription_active' | 'trial_used'
  > | null

  const plan = profile ? resolvePlan(profile) : 'free'
  const trialUsed = profile?.trial_used ?? false
  const videoCount = await getVideoCount(supabase, user.id)

  if (!canIndexVideo(plan, videoCount, trialUsed)) {
    return ingestError(
      INGEST_ERROR.VIDEO_LIMIT_REACHED,
      'Has alcanzado el limite de videos de tu plan.',
    )
  }

  // ── Phase 1 — Transcript ───────────────────────────────────────────────────
  let youtubeId: string
  let fullText: string

  try {
    const result = await fetchYoutubeTranscript(youtubeUrl)
    youtubeId = result.videoId
    fullText = result.fullText
  } catch (error) {
    if (error instanceof TranscriptFetchError) {
      const code =
        error.code === TRANSCRIPT_ERROR.INVALID_URL
          ? INGEST_ERROR.INVALID_URL
          : INGEST_ERROR.TRANSCRIPT_FAILED
      return ingestError(code, error.message)
    }
    return ingestError(
      INGEST_ERROR.TRANSCRIPT_FAILED,
      'Transcript extraction failed.',
    )
  }

  // ── Phase 2 — Chunk ────────────────────────────────────────────────────────
  const chunks = chunkText(fullText, CHUNK_CONFIG)

  if (chunks.length === 0) {
    return ingestError(
      INGEST_ERROR.CHUNK_FAILED,
      'No chunks generated from transcript.',
    )
  }

  // ── Phase 3 — Embed ────────────────────────────────────────────────────────
  let sections: EmbeddedChunk[]

  try {
    sections = await embedChunks(chunks)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Embedding generation failed.'
    return ingestError(INGEST_ERROR.EMBED_FAILED, message)
  }

  // ── Phase 4 — Store ────────────────────────────────────────────────────────
  let videoId: string
  let sectionCount: number

  try {
    const result = await storeVideoSections(supabase, {
      youtubeId,
      title,
      userId: user.id,
      sections,
    })
    videoId = result.videoId
    sectionCount = result.count
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Storing video sections failed.'
    return ingestError(INGEST_ERROR.STORE_FAILED, message)
  }

  // ── Phase 5 — Intelligence Report (required) ───────────────────────────────
  let report: IntelligenceReport

  try {
    const intelligenceReport = await generateIntelligenceReport({
      transcript: fullText,
      title,
    })

    const { data: inserted, error: upsertError } = await (
      supabase.from('intelligence_reports') as ReturnType<typeof supabase.from>
    )
      .upsert(
        {
          video_id: videoId,
          report: intelligenceReport,
          generated_at: intelligenceReport.generatedAt,
        } as unknown as ReportRow,
        { onConflict: 'video_id' },
      )
      .select('id')
      .single()

    if (upsertError || !inserted) {
      throw new Error('Failed to persist intelligence report.')
    }

    report = intelligenceReport
  } catch (error) {
    await rollbackStoredVideo(supabase, videoId, user.id)
    const message =
      error instanceof Error
        ? error.message
        : 'No se pudo generar el informe de inteligencia.'
    return ingestError(INGEST_ERROR.REPORT_FAILED, message)
  }

  // ── Phase 6 — SEO Pack (required) ───────────────────────────────────────────
  let seoReport: SeoReport

  try {
    const seoReportData = await generateSeoReport({
      transcript: fullText,
      title,
    })

    const { data: inserted, error: upsertError } = await (
      supabase.from('seo_reports') as ReturnType<typeof supabase.from>
    )
      .upsert(
        {
          video_id: videoId,
          report: seoReportData,
          generated_at: seoReportData.generatedAt,
        } as unknown as SeoReportRow,
        { onConflict: 'video_id' },
      )
      .select('id')
      .single()

    if (upsertError || !inserted) {
      throw new Error('Failed to persist SEO report.')
    }

    seoReport = seoReportData
  } catch (error) {
    await rollbackStoredVideo(supabase, videoId, user.id)
    const message =
      error instanceof Error ? error.message : 'No se pudo generar el SEO Pack.'
    return ingestError(INGEST_ERROR.REPORT_FAILED, message)
  }

  // Finalization (only after all 6 phases succeed)
  await supabase.from('profiles').update({ trial_used: true }).eq('id', user.id)

  // Invalidate dashboard cache so next load reflects the new video
  updateTag(`dashboard-${user.id}`)

  // Invalidate quick-prompts cache so new AI chips are generated on next visit
  updateTag('quick-prompts')

  return { ok: true, videoId, sectionCount, report, seoReport }
}
