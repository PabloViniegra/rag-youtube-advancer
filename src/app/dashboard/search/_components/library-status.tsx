'use client'

/**
 * LibraryStatus — /onboard
 *
 * Shows video library context above the search form:
 *  - loading  → skeleton pulse
 *  - 0 videos → empty state with CTA to add first video
 *  - N videos → compact count + manage link
 */

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { LibraryStatsResponse } from '@/app/api/library-stats/route'

type StatusState = 'loading' | 'empty' | 'ready'

export function LibraryStatus() {
  const [videoCount, setVideoCount] = useState(0)
  const [status, setStatus] = useState<StatusState>('loading')

  useEffect(() => {
    fetch('/api/library-stats')
      .then((r) => r.json() as Promise<LibraryStatsResponse>)
      .then((data) => {
        setVideoCount(data.videoCount)
        setStatus(data.videoCount === 0 ? 'empty' : 'ready')
      })
      .catch(() => {
        // Best-effort — on error, don't block search
        setStatus('ready')
      })
  }, [])

  if (status === 'loading') {
    return (
      <div
        aria-hidden="true"
        className="h-8 w-52 animate-pulse rounded-lg bg-surface-container"
      />
    )
  }

  if (status === 'empty') {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="font-body text-sm font-semibold text-on-surface">
            Tu biblioteca está vacía
          </p>
          <p className="font-body text-xs text-on-surface-variant">
            Añade al menos un video para poder buscar en él.
          </p>
        </div>
        <Link
          href="/dashboard/videos/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-body text-sm font-bold text-on-primary transition-all hover:bg-primary-dim active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <PlusIcon />
          Añadir video
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <p className="font-body text-xs text-on-surface-variant">
        <span className="font-semibold text-on-surface" data-tabular-nums>
          {videoCount}
        </span>{' '}
        {videoCount === 1 ? 'video indexado' : 'videos indexados'}
      </p>
      <Link
        href="/dashboard/videos"
        className="font-body text-xs font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:rounded"
      >
        Gestionar →
      </Link>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
