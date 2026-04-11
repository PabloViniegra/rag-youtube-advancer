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
  activityDays: boolean[]
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
    return {
      videoCount: 0,
      sectionCount: 0,
      recentVideos: [],
      activityDays: Array(7).fill(false),
    }
  }

  const { data } = await supabaseAdmin
    .from('videos')
    .select('id, youtube_id, title, created_at, video_sections(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const allVideos = (data ?? []) as VideoRow[]

  // ── Activity days — last 7 calendar days ─────────────────────────────────
  const now = new Date()
  const activityDays: boolean[] = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now)
    day.setDate(now.getDate() - (6 - i))
    const dayStr = day.toISOString().slice(0, 10) // "YYYY-MM-DD"
    return allVideos.some((v) => v.created_at.slice(0, 10) === dayStr)
  })

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
    activityDays,
  }
}
