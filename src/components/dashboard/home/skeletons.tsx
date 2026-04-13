import { cn } from '@/lib/utils'

// ── Primitive pulse bar ─────────────────────────────────────────────────────

function PulseBar({ className }: { className: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-surface-container-high',
        className,
      )}
    />
  )
}

// ── Exported skeleton components ────────────────────────────────────────────

/**
 * Full-page skeleton — personalised with displayName so the user sees
 * "Hola, Pablo." while the DB query runs, not a generic placeholder.
 */
interface DashboardSkeletonProps {
  displayName: string
}

export function DashboardSkeleton({ displayName }: DashboardSkeletonProps) {
  const now = new Date()
  const rawDay = now.toLocaleDateString('es-ES', { weekday: 'long' })
  const day = rawDay.charAt(0).toUpperCase() + rawDay.slice(1)
  const dateStr = now.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
  const overline = `${day} · ${dateStr}`

  return (
    <div className="flex flex-col gap-8">
      {/* ── Hero ── */}
      <header className="border-b border-outline-variant pb-6">
        <span className="mb-3 inline-block rounded-sm bg-primary-container px-2 py-0.5 font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          {overline}
        </span>
        <p className="font-headline text-4xl font-black leading-[1.05] text-on-surface md:text-5xl">
          Hola, <span className="text-primary">{displayName}</span>.
        </p>
        {/* Stats block placeholder */}
        <div className="mt-5 flex items-end gap-8">
          <div className="flex flex-col gap-1">
            <PulseBar className="h-10 w-16 md:h-12" />
            <PulseBar className="h-2.5 w-24" />
          </div>
          <div className="mb-1 h-8 w-px bg-outline-variant" />
          <div className="flex flex-col gap-1">
            <PulseBar className="h-10 w-16 md:h-12" />
            <PulseBar className="h-2.5 w-32" />
          </div>
        </div>
      </header>

      {/* ── Quick actions — single col skeleton; real component decides cols based on hasVideos ── */}
      <div className="grid grid-cols-1 gap-3">
        <PulseBar className="h-11 rounded-lg" />
      </div>

      {/* ── Brain status ── */}
      <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
        <div className="mb-3 flex items-center justify-between">
          <PulseBar className="h-3 w-28" />
          <PulseBar className="h-3 w-8" />
        </div>
        <PulseBar className="mb-3 h-1.5 w-full rounded-full" />
        <div className="flex items-center justify-between">
          <PulseBar className="h-3 w-24" />
          <PulseBar className="h-3 w-20" />
        </div>
      </div>

      {/* ── Contextual tip ── */}
      <div className="rounded-lg border border-secondary-fixed-dim bg-secondary-container px-4 py-3">
        <PulseBar className="mb-2 h-2.5 w-24 bg-secondary-fixed-dim" />
        <PulseBar className="h-4 w-3/4 bg-secondary-fixed-dim" />
      </div>

      {/* ── Recent videos list ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <PulseBar className="h-3 w-36" />
          <PulseBar className="h-3 w-16" />
        </div>
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-outline-variant px-3 py-3"
            >
              <PulseBar className="h-8 w-14 flex-shrink-0 rounded" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <PulseBar className="h-4 w-3/4" />
                <PulseBar className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
