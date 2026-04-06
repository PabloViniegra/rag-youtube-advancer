import { cache } from 'react'

import { createClient } from '@/lib/supabase/server'

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
 * Wrapped in React.cache() for per-request deduplication — multiple
 * Server Components can call this with the same userId and the DB
 * query only runs once per request.
 */
export const getDashboardData = cache(
  async (userId: string): Promise<DashboardData> => {
    if (!userId) {
      return { videoCount: 0, sectionCount: 0, recentVideos: [] }
    }

    const supabase = await createClient()
    const { data } = await supabase
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
  },
)
