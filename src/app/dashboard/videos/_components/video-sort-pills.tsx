'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { startTransition } from 'react'
import { cn } from '@/lib/utils'
import {
  DEFAULT_SORT,
  isVideoSort,
  VIDEO_SORT_OPTIONS,
  type VideoSort,
} from './video-sort'

/**
 * Self-contained sort pill-tabs. Reads and writes the ?sort= URL param.
 * Uses router.replace + startTransition so list-item ViewTransitions animate
 * on reorder without triggering the page-level directional slide.
 */
export function VideoSortPills() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawSort = searchParams.get('sort')
  const activeSort: VideoSort = isVideoSort(rawSort) ? rawSort : DEFAULT_SORT

  function handleSortChange(sort: VideoSort) {
    const params = new URLSearchParams(searchParams.toString())
    if (sort === DEFAULT_SORT) {
      params.delete('sort')
    } else {
      params.set('sort', sort)
    }
    const qs = params.toString()
    startTransition(() => {
      router.replace(qs ? `?${qs}` : '?', { scroll: false })
    })
  }

  return (
    <div
      role="group"
      aria-label="Ordenar videos"
      className="flex flex-wrap items-center gap-1.5"
    >
      <span className="mr-1 font-body text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
        Orden
      </span>
      {VIDEO_SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={activeSort === opt.value}
          onClick={() => handleSortChange(opt.value)}
          className={cn(
            'rounded-lg border px-3 py-1.5',
            'font-body text-xs font-semibold',
            'transition-colors',
            activeSort === opt.value
              ? 'border-primary bg-primary text-on-primary'
              : 'border-outline-variant bg-surface-container text-on-surface-variant hover:border-primary/60 hover:text-on-surface',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
