'use client'

/**
 * SourceCard — individual RAG source fragment.
 *
 * Shows the video title (primary identifier), similarity tier via a colored
 * left border, and a clipped content excerpt.
 */

import type { VideoSectionMatch } from '@/lib/retrieval/types'
import { cn } from '@/lib/utils'

export function SourceCard({
  source,
  index,
}: {
  source: VideoSectionMatch
  index: number
}) {
  const pct = Math.round(source.similarity * 100)

  const leftBorderClass =
    pct >= 70
      ? 'border-l-secondary'
      : pct >= 40
        ? 'border-l-primary'
        : 'border-l-outline-variant'

  const badgeClass =
    pct >= 70
      ? 'bg-secondary/15 text-secondary-dim'
      : pct >= 40
        ? 'bg-primary/10 text-primary'
        : 'bg-surface-container text-on-surface-variant'

  const title = source.videoTitle?.trim() || null

  return (
    <li
      className={cn(
        'animate-fade-up stagger-item flex flex-col gap-2 rounded-r-xl border border-l-4 border-outline-variant bg-surface-container-low px-4 py-3',
        leftBorderClass,
      )}
      style={{ '--i': index + 1 } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 font-body text-xs font-semibold text-on-surface">
          {title ? (
            <span className="block truncate" title={title}>
              {title}
            </span>
          ) : (
            <span className="text-on-surface-variant">Fuente {index + 1}</span>
          )}
        </span>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-body text-xs font-semibold',
            badgeClass,
          )}
        >
          <span className="sr-only">Similitud: </span>
          {pct}%
        </span>
      </div>
      <p className="line-clamp-3 font-body text-sm text-on-surface">
        {source.content}
      </p>
    </li>
  )
}
