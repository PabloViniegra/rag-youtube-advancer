import type { Database } from '@/lib/supabase/types'

type VideoRow = Database['public']['Tables']['videos']['Row']

// ── Sort option constants ──────────────────────────────────────────────────────

export const VIDEO_SORT = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  TITLE_ASC: 'title_asc',
  TITLE_DESC: 'title_desc',
} as const

export type VideoSort = (typeof VIDEO_SORT)[keyof typeof VIDEO_SORT]

export interface VideoSortOption {
  value: VideoSort
  label: string
}

export const VIDEO_SORT_OPTIONS: VideoSortOption[] = [
  { value: VIDEO_SORT.NEWEST, label: 'Más recientes' },
  { value: VIDEO_SORT.OLDEST, label: 'Más antiguos' },
  { value: VIDEO_SORT.TITLE_ASC, label: 'Título A → Z' },
  { value: VIDEO_SORT.TITLE_DESC, label: 'Título Z → A' },
]

export const DEFAULT_SORT: VideoSort = VIDEO_SORT.NEWEST

// ── Type guard ────────────────────────────────────────────────────────────────

export function isVideoSort(value: unknown): value is VideoSort {
  return (
    typeof value === 'string' &&
    (Object.values(VIDEO_SORT) as string[]).includes(value)
  )
}

// ── Pure filter / sort helpers ────────────────────────────────────────────────

export function filterVideos(videos: VideoRow[], query: string): VideoRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return videos
  return videos.filter((v) => (v.title ?? '').toLowerCase().includes(q))
}

export function sortVideos(videos: VideoRow[], sort: VideoSort): VideoRow[] {
  const arr = [...videos]
  switch (sort) {
    case VIDEO_SORT.NEWEST:
      return arr.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    case VIDEO_SORT.OLDEST:
      return arr.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
    case VIDEO_SORT.TITLE_ASC:
      return arr.sort((a, b) =>
        (a.title ?? '').localeCompare(b.title ?? '', 'es'),
      )
    case VIDEO_SORT.TITLE_DESC:
      return arr.sort((a, b) =>
        (b.title ?? '').localeCompare(a.title ?? '', 'es'),
      )
  }
}
