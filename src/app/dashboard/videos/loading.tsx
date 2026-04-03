/**
 * Loading skeleton for /dashboard/videos
 *
 * Mirrors the layout of videos/page.tsx:
 *  - Editorial header: overline chip + h1 + subline + CTA button
 *  - Asymmetric card grid (same 1-col → 2-col → 3-col breakpoints)
 *
 * animate-pulse is suppressed globally for prefers-reduced-motion users
 * via the @media block in globals.css.
 */

import { ViewTransition } from 'react'

const SKELETON_KEYS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5', 'sk-6'] as const

export default function VideosLoading() {
  return (
    <ViewTransition exit="slide-down" default="none">
      <div className="flex flex-col gap-8" aria-busy="true">
        {/* ── Page header skeleton — mirrors editorial header ── */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant pb-6">
          <div className="flex flex-col gap-2">
            {/* Overline */}
            <div className="h-3 w-28 animate-pulse rounded bg-surface-container" />
            {/* h1 */}
            <div className="h-9 w-36 animate-pulse rounded-lg bg-surface-container md:w-48" />
            {/* Subline */}
            <div className="h-3.5 w-60 animate-pulse rounded-md bg-surface-container" />
          </div>
          {/* CTA button */}
          <div className="h-10 w-32 animate-pulse rounded-xl bg-surface-container" />
        </div>

        {/* ── Cards skeleton grid ── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SKELETON_KEYS.map((key) => (
            <VideoCardSkeleton key={key} />
          ))}
        </div>
      </div>
    </ViewTransition>
  )
}

function VideoCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-background shadow-sm">
      {/* Thumbnail placeholder */}
      <div className="aspect-video w-full animate-pulse bg-surface-container" />

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-full animate-pulse rounded-md bg-surface-container" />
          <div className="h-4 w-3/4 animate-pulse rounded-md bg-surface-container" />
        </div>

        {/* Chip + date row */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="h-5 w-24 animate-pulse rounded-full bg-surface-container" />
          <div className="h-4 w-20 animate-pulse rounded-md bg-surface-container" />
        </div>

        {/* Button */}
        <div className="h-8 w-full animate-pulse rounded-xl bg-surface-container" />
      </div>
    </div>
  )
}
