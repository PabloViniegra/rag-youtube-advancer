'use server'

/**
 * Server Actions for video management.
 */

import { revalidatePath, updateTag } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/actions'
import { generateIntelligenceReport } from '@/lib/intelligence/generate'
import { logger } from '@/lib/logger'
import { generateSeoReport } from '@/lib/seo/generate'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

export interface DeleteVideoResult {
  error?: string
}

export interface RegenerateReportResult {
  ok: boolean
  error?: string
}

export interface VideoSectionStats {
  sectionCount: number
  contentSizeChars: number
}

export interface GetVideoSectionStatsResult {
  data?: VideoSectionStats
  error?: string
}

type VideoRow = Database['public']['Tables']['videos']['Row']
type SectionRow = Database['public']['Tables']['video_sections']['Row']
type IntelligenceReportRow =
  Database['public']['Tables']['intelligence_reports']['Row']
type SeoReportRow = Database['public']['Tables']['seo_reports']['Row']

interface TranscriptSource {
  ok: boolean
  title?: string | null
  transcript?: string
  error?: string
}

function buildTranscript(chunks: Pick<SectionRow, 'content'>[]): string {
  return chunks
    .map((chunk) => chunk.content?.trim() ?? '')
    .filter((content) => content.length > 0)
    .join('\n\n')
}

async function loadTranscriptSource(
  videoId: string,
  userId: string,
): Promise<TranscriptSource> {
  const supabase = await createClient()

  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('id, title')
    .eq('id', videoId)
    .eq('user_id', userId)
    .maybeSingle()

  if (videoError || !video) {
    return { ok: false, error: 'Video no encontrado.' }
  }

  const { data: sections, error: sectionsError } = await supabase
    .from('video_sections')
    .select('content')
    .eq('video_id', videoId)
    .order('id')

  if (sectionsError) {
    return {
      ok: false,
      error: 'No se pudieron cargar los fragmentos del video.',
    }
  }

  const transcript = buildTranscript(
    (sections ?? []) as Pick<SectionRow, 'content'>[],
  )

  if (transcript.length === 0) {
    return {
      ok: false,
      error: 'Este video no tiene fragmentos para regenerar reportes.',
    }
  }

  return {
    ok: true,
    title: (video as Pick<VideoRow, 'title'>).title,
    transcript,
  }
}

/**
 * Permanently deletes a video and all associated data (video_sections,
 * intelligence_reports) via the ON DELETE CASCADE FK constraint.
 *
 * Validates that the authenticated user owns the video before deletion.
 */
export async function deleteVideo(videoId: string): Promise<DeleteVideoResult> {
  const user = await getCurrentUser()
  if (!user) return { error: 'No autenticado.' }

  const supabase = await createClient()

  // Verify ownership before delete (defence-in-depth alongside RLS)
  const { data: video, error: fetchError } = await supabase
    .from('videos')
    .select('id')
    .eq('id', videoId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchError) return { error: 'Error al verificar el video.' }
  if (!video) return { error: 'Video no encontrado.' }

  const { error: deleteError } = await supabase
    .from('videos')
    .delete()
    .eq('id', videoId)
    .eq('user_id', user.id)

  if (deleteError) return { error: 'No se pudo eliminar el video.' }

  revalidatePath('/dashboard/videos')
  updateTag(`dashboard-${user.id}`)

  return {}
}

export async function regenerateIntelligenceReport(
  videoId: string,
): Promise<RegenerateReportResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'No autenticado.' }

  if (videoId.trim() === '') {
    return { ok: false, error: 'ID de video inválido.' }
  }

  const source = await loadTranscriptSource(videoId, user.id)
  if (!source.ok || !source.transcript) {
    return {
      ok: false,
      error: source.error ?? 'No se pudo preparar el reporte.',
    }
  }

  const supabase = await createClient()

  try {
    const report = await generateIntelligenceReport({
      transcript: source.transcript,
      title: source.title ?? undefined,
    })

    const { error } = await (
      supabase.from('intelligence_reports') as ReturnType<typeof supabase.from>
    ).upsert(
      {
        video_id: videoId,
        report,
        generated_at: report.generatedAt,
      } as unknown as IntelligenceReportRow,
      { onConflict: 'video_id' },
    )

    if (error) {
      return {
        ok: false,
        error: 'No se pudo guardar el informe de inteligencia regenerado.',
      }
    }

    revalidatePath(`/dashboard/videos/${videoId}`)
    updateTag(`dashboard-${user.id}`)

    return { ok: true }
  } catch (error) {
    logger.error(
      'videos-actions',
      'Unexpected error regenerating intelligence report.',
      error,
    )
    return {
      ok: false,
      error: 'No se pudo regenerar el informe de inteligencia.',
    }
  }
}

export async function regenerateSeoReport(
  videoId: string,
): Promise<RegenerateReportResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'No autenticado.' }

  if (videoId.trim() === '') {
    return { ok: false, error: 'ID de video inválido.' }
  }

  const source = await loadTranscriptSource(videoId, user.id)
  if (!source.ok || !source.transcript) {
    return {
      ok: false,
      error: source.error ?? 'No se pudo preparar el reporte.',
    }
  }

  const supabase = await createClient()

  try {
    const report = await generateSeoReport({
      transcript: source.transcript,
      title: source.title ?? undefined,
    })

    const { error } = await (
      supabase.from('seo_reports') as ReturnType<typeof supabase.from>
    ).upsert(
      {
        video_id: videoId,
        report,
        generated_at: report.generatedAt,
      } as unknown as SeoReportRow,
      { onConflict: 'video_id' },
    )

    if (error) {
      return {
        ok: false,
        error: 'No se pudo guardar el SEO Pack regenerado.',
      }
    }

    revalidatePath(`/dashboard/videos/${videoId}`)
    updateTag(`dashboard-${user.id}`)

    return { ok: true }
  } catch (error) {
    logger.error(
      'videos-actions',
      'Unexpected error regenerating SEO report.',
      error,
    )
    return { ok: false, error: 'No se pudo regenerar el SEO Pack.' }
  }
}

/**
 * Returns section count and approximate content size for a video.
 * Validates that the authenticated user owns the video (defence-in-depth with RLS).
 */
export async function getVideoSectionStats(
  videoId: string,
): Promise<GetVideoSectionStatsResult> {
  const user = await getCurrentUser()
  if (!user) return { error: 'No autenticado.' }

  const supabase = await createClient()

  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('id')
    .eq('id', videoId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (videoError) return { error: 'Error al verificar el video.' }
  if (!video) return { error: 'Video no encontrado.' }

  const { data: sections, error: sectionsError } = await supabase
    .from('video_sections')
    .select('content')
    .eq('video_id', videoId)

  if (sectionsError) return { error: 'No se pudieron cargar las estadísticas.' }

  const rows = sections ?? []
  const sectionCount = rows.length
  const contentSizeChars = rows.reduce(
    (acc, s) => acc + (s.content?.length ?? 0),
    0,
  )

  return { data: { sectionCount, contentSizeChars } }
}
