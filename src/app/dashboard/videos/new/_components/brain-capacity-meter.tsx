'use client'

/**
 * BrainCapacityMeter
 *
 * Animated fill bar showing how full the user's "brain" is.
 * Fill = totalVideoCount / 25 * 100 % (25 videos = full capacity).
 * Bar animates from 0% to target width on mount via useEffect.
 */

import { useEffect, useState } from 'react'

// ── Props ─────────────────────────────────────────────────────────────────────

interface BrainCapacityMeterProps {
  newSectionCount: number
  totalVideoCount: number
}

// ── Component ─────────────────────────────────────────────────────────────────

const MAX_VIDEOS = 25

export function BrainCapacityMeter({
  newSectionCount,
  totalVideoCount,
}: BrainCapacityMeterProps) {
  const targetPercent = Math.min((totalVideoCount / MAX_VIDEOS) * 100, 100)
  const [fillPercent, setFillPercent] = useState(0)

  useEffect(() => {
    // Defer to next frame so the CSS transition fires from 0 → target
    const id = requestAnimationFrame(() => {
      setFillPercent(targetPercent)
    })
    return () => cancelAnimationFrame(id)
  }, [targetPercent])

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="font-body text-xs font-semibold text-on-surface-variant">
          Capacidad del cerebro
        </span>
        <span className="font-body text-xs text-primary font-semibold">
          +{newSectionCount} nuevos fragmentos
        </span>
      </div>

      {/* Bar track */}
      <div
        role="meter"
        aria-label="Capacidad del cerebro"
        aria-valuenow={Math.round(fillPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest"
      >
        <div
          aria-hidden="true"
          className="h-full rounded-full bg-primary motion-reduce:transition-none"
          style={{
            width: `${fillPercent}%`,
            transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
          }}
        />
      </div>

      {/* Video count */}
      <p className="font-body text-xs text-on-surface-variant text-right">
        {totalVideoCount} / {MAX_VIDEOS} videos
      </p>
    </div>
  )
}
