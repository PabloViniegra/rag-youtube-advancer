'use client'

// ── VideosPageClient ──────────────────────────────────────────────────────────
// Client wrapper that owns search/sort state and coordinates the toolbar with
// the video grid. Both toolbar and grid live inside the same Suspense boundary
// because both rely on useSearchParams(), which requires a Suspense ancestor
// in the App Router. The fallback skeleton covers both during SSR hydration.

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import type { Database } from '@/lib/supabase/types'
import { VideoGrid } from './video-grid'
import {
  DEFAULT_SORT,
  filterVideos,
  isVideoSort,
  sortVideos,
} from './video-sort'
import { VideosToolbar } from './videos-toolbar'

type VideoRow = Database['public']['Tables']['videos']['Row']

interface VideosPageClientProps {
  initialVideos: VideoRow[]
  canIndex: boolean
}

// Inner component that reads search params — must be inside Suspense when used
// in the App Router. We keep it as a separate function to isolate the
// useSearchParams call.
function VideosPageInner({ initialVideos, canIndex }: VideosPageClientProps) {
  const searchParams = useSearchParams()
  const rawSort = searchParams.get('sort')
  const activeSort = isVideoSort(rawSort) ? rawSort : DEFAULT_SORT

  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get('q') ?? '',
  )

  const filtered = filterVideos(initialVideos, searchQuery)
  const sorted = sortVideos(filtered, activeSort)
  const hasActiveSearch = searchQuery.trim().length > 0

  return (
    <>
      <VideosToolbar
        onQueryChange={setSearchQuery}
        totalCount={initialVideos.length}
        filteredCount={filtered.length}
      />
      <VideoGrid
        initialVideos={initialVideos}
        sortedFilteredVideos={sorted}
        hasActiveSearch={hasActiveSearch}
        searchQuery={searchQuery}
        onClearSearch={() => setSearchQuery('')}
        canIndex={canIndex}
      />
    </>
  )
}

const GRID_SKELETON_KEYS = [
  'sk-1',
  'sk-2',
  'sk-3',
  'sk-4',
  'sk-5',
  'sk-6',
] as const

export function VideosPageClient({ initialVideos, canIndex }: VideosPageClientProps) {
  return (
    <Suspense
      fallback={
        <div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
        >
          {GRID_SKELETON_KEYS.map((k) => (
            <div
              key={k}
              className="aspect-video w-full animate-pulse rounded-2xl bg-surface-container"
            />
          ))}
        </div>
      }
    >
      <VideosPageInner initialVideos={initialVideos} canIndex={canIndex} />
    </Suspense>
  )
}
