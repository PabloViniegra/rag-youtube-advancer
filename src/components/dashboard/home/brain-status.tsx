'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

const OPTIMAL_VIDEOS = 25

const DAY_KEYS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'] as const

interface BrainStatusProps {
  videoCount: number
  activityDays?: boolean[]
}

const STATUS_LABELS = {
  empty: 'Cerebro vacío',
  building: 'En construcción',
  active: 'Cerebro activo',
  optimized: 'Cerebro optimizado',
} as const

type StatusLabel = (typeof STATUS_LABELS)[keyof typeof STATUS_LABELS]

function getStatusLabel(pct: number): StatusLabel {
  if (pct === 0) return STATUS_LABELS.empty
  if (pct < 40) return STATUS_LABELS.building
  if (pct < 80) return STATUS_LABELS.active
  return STATUS_LABELS.optimized
}

export function BrainStatus({ videoCount, activityDays }: BrainStatusProps) {
  const rawPct = Math.round((videoCount / OPTIMAL_VIDEOS) * 100)
  const pct = Math.min(rawPct, 100)
  const statusLabel = getStatusLabel(pct)
  const isEmpty = pct === 0

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Single RAF tick so the fill animates from 0 on first paint
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const days = activityDays ?? Array<boolean>(7).fill(false)

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Estado del cerebro
        </span>
        <span
          className={cn(
            'font-headline text-sm font-extrabold',
            isEmpty ? 'text-outline' : 'text-primary',
          )}
        >
          {pct}%
        </span>
      </div>

      {/* Progress track — liquid fill */}
      <div
        className="mb-3 h-1.5 overflow-hidden rounded-full bg-outline-variant"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso del cerebro"
      >
        <div
          className={cn(
            'relative h-full overflow-hidden rounded-full motion-reduce:transition-none',
            isEmpty ? 'bg-outline-variant' : 'bg-primary',
          )}
          style={{
            width: mounted ? `${Math.max(pct, 2)}%` : '0%',
            transition: mounted
              ? 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none',
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="font-body text-[11px] text-on-surface-variant">
          {statusLabel}
        </span>
        <span className="font-body text-[11px] text-on-surface-variant">
          {videoCount} / {OPTIMAL_VIDEOS} videos · óptimo
        </span>
      </div>

      {/* Weekly activity streak */}
      <div
        className="mt-3 flex items-center gap-1.5"
        role="img"
        aria-label="Actividad esta semana"
      >
        <span className="font-body text-[10px] text-on-surface-variant mr-1">
          Actividad:
        </span>
        {days.map((active, i) => (
          <span
            key={DAY_KEYS[i]}
            className={cn(
              'inline-block h-2.5 w-2.5 rounded-sm',
              active ? 'bg-primary' : 'bg-outline-variant opacity-40',
            )}
          />
        ))}
      </div>
    </div>
  )
}
