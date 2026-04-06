import { cn } from '@/lib/utils'

const OPTIMAL_VIDEOS = 25

interface BrainStatusProps {
  videoCount: number
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

export function BrainStatus({ videoCount }: BrainStatusProps) {
  const rawPct = Math.round((videoCount / OPTIMAL_VIDEOS) * 100)
  const pct = Math.min(rawPct, 100)
  const statusLabel = getStatusLabel(pct)
  const isEmpty = pct === 0

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

      {/* Progress track */}
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
            'h-full rounded-full transition-all duration-500',
            isEmpty ? 'bg-outline-variant' : 'bg-primary',
          )}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="font-body text-[11px] text-on-surface-variant">
          {statusLabel}
        </span>
        <span className="font-body text-[11px] text-on-surface-variant">
          {videoCount} / {OPTIMAL_VIDEOS} videos
        </span>
      </div>
    </div>
  )
}
