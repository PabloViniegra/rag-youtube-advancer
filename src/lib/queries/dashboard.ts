import { cacheLife, cacheTag } from 'next/cache'

import { supabaseAdmin } from '@/lib/supabase/admin'

// ── Internal DB shape ───────────────────────────────────────────────────────

type VideoRow = {
  id: string
  youtube_id: string
  title: string | null
  created_at: string
  video_sections: Array<{ count: number }>
}

// ── Public types ────────────────────────────────────────────────────────────

export type DashboardVideoItem = {
  id: string
  youtube_id: string
  title: string | null
  created_at: string
  sectionCount: number
}

export type DashboardData = {
  videoCount: number
  sectionCount: number
  recentVideos: DashboardVideoItem[]
}

/**
 * Fetches all videos for a user with embedded section counts.
 *
 * Uses `'use cache'` for cross-request caching (minutes granularity).
 * Keyed by userId so each user's data is cached independently.
 * Uses supabaseAdmin (service role) — safe because the query is
 * explicitly filtered by userId, and the caller has already verified auth.
 *
 * Invalidate with: revalidateTag(`dashboard-${userId}`)
 */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  'use cache'
  cacheTag(`dashboard-${userId}`)
  cacheLife('minutes')

  if (!userId) {
    return { videoCount: 0, sectionCount: 0, recentVideos: [] }
  }

  const { data } = await supabaseAdmin
    .from('videos')
    .select('id, youtube_id, title, created_at, video_sections(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const allVideos = (data ?? []) as VideoRow[]

  return {
    videoCount: allVideos.length,
    sectionCount: allVideos.reduce(
      (sum, v) => sum + (v.video_sections[0]?.count ?? 0),
      0,
    ),
    recentVideos: allVideos.slice(0, 3).map((v) => ({
      id: v.id,
      youtube_id: v.youtube_id,
      title: v.title,
      created_at: v.created_at,
      sectionCount: v.video_sections[0]?.count ?? 0,
    })),
  }
}
