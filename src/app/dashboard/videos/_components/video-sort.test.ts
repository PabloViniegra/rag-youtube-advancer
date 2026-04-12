import { describe, expect, it } from 'vitest'
import type { Database } from '@/lib/supabase/types'
import {
  DEFAULT_SORT,
  filterVideos,
  isVideoSort,
  sortVideos,
  VIDEO_SORT,
} from './video-sort'

type VideoRow = Database['public']['Tables']['videos']['Row']

function makeVideo(
  id: string,
  title: string | null,
  created_at: string,
): VideoRow {
  return { id, user_id: 'user-1', youtube_id: `yt-${id}`, title, created_at }
}

// ── isVideoSort ───────────────────────────────────────────────────────────────

describe('isVideoSort', () => {
  it('returns true for all valid sort values', () => {
    for (const v of Object.values(VIDEO_SORT)) {
      expect(isVideoSort(v)).toBe(true)
    }
  })

  it('returns false for unknown string values', () => {
    expect(isVideoSort('foo')).toBe(false)
    expect(isVideoSort('')).toBe(false)
    expect(isVideoSort('asc')).toBe(false)
  })

  it('returns false for non-string types', () => {
    expect(isVideoSort(null)).toBe(false)
    expect(isVideoSort(undefined)).toBe(false)
    expect(isVideoSort(42)).toBe(false)
    expect(isVideoSort({})).toBe(false)
  })
})

// ── filterVideos ─────────────────────────────────────────────────────────────

describe('filterVideos', () => {
  const videos: VideoRow[] = [
    makeVideo('1', 'React Tutorial', '2024-01-01T00:00:00Z'),
    makeVideo('2', 'Next.js Tips', '2024-01-02T00:00:00Z'),
    makeVideo('3', null, '2024-01-03T00:00:00Z'),
    makeVideo('4', 'Advanced React Hooks', '2024-01-04T00:00:00Z'),
  ]

  it('returns all videos when query is empty', () => {
    expect(filterVideos(videos, '')).toHaveLength(4)
    expect(filterVideos(videos, '  ')).toHaveLength(4)
  })

  it('filters case-insensitively by title', () => {
    expect(filterVideos(videos, 'react')).toHaveLength(2)
    expect(filterVideos(videos, 'REACT')).toHaveLength(2)
    expect(filterVideos(videos, 'next')).toHaveLength(1)
  })

  it('treats null titles as empty string — no match', () => {
    const result = filterVideos(videos, 'null')
    expect(result).toHaveLength(0)
  })

  it('returns only exact substring matches', () => {
    const result = filterVideos(videos, 'Advanced')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('4')
  })

  it('returns empty array when nothing matches', () => {
    expect(filterVideos(videos, 'xxxxxxx')).toHaveLength(0)
  })
})

// ── sortVideos ────────────────────────────────────────────────────────────────

describe('sortVideos', () => {
  const videos: VideoRow[] = [
    makeVideo('b', 'Beta', '2024-01-02T00:00:00Z'),
    makeVideo('c', 'Gamma', '2024-01-03T00:00:00Z'),
    makeVideo('a', 'Alpha', '2024-01-01T00:00:00Z'),
  ]

  it('sorts newest first', () => {
    const result = sortVideos(videos, VIDEO_SORT.NEWEST)
    expect(result.map((v) => v.id)).toEqual(['c', 'b', 'a'])
  })

  it('sorts oldest first', () => {
    const result = sortVideos(videos, VIDEO_SORT.OLDEST)
    expect(result.map((v) => v.id)).toEqual(['a', 'b', 'c'])
  })

  it('sorts title A → Z', () => {
    const result = sortVideos(videos, VIDEO_SORT.TITLE_ASC)
    expect(result.map((v) => v.id)).toEqual(['a', 'b', 'c'])
  })

  it('sorts title Z → A', () => {
    const result = sortVideos(videos, VIDEO_SORT.TITLE_DESC)
    expect(result.map((v) => v.id)).toEqual(['c', 'b', 'a'])
  })

  it('does not mutate the original array', () => {
    const original = [...videos]
    sortVideos(videos, VIDEO_SORT.TITLE_ASC)
    expect(videos).toEqual(original)
  })

  it('DEFAULT_SORT equals newest', () => {
    expect(DEFAULT_SORT).toBe(VIDEO_SORT.NEWEST)
  })
})
