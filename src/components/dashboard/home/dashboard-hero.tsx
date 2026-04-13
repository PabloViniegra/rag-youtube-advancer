import { DashboardHeroStats } from './dashboard-hero-stats'

interface DashboardHeroProps {
  displayName: string
  videoCount: number
  sectionCount: number
  hasVideos: boolean
}

export function DashboardHero({
  displayName,
  videoCount,
  sectionCount,
  hasVideos,
}: DashboardHeroProps) {
  const now = new Date()
  const rawDay = now.toLocaleDateString('es-ES', { weekday: 'long' })
  const day = rawDay.charAt(0).toUpperCase() + rawDay.slice(1)
  const dateStr = now.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
  const overline = `${day} · ${dateStr}`

  return (
    <header className="border-b border-outline-variant pb-6">
      <span className="mb-3 inline-block rounded-sm bg-primary-container px-2 py-0.5 font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
        {overline}
      </span>
      <h1 className="font-headline text-5xl font-extrabold tracking-tight leading-[0.95] text-on-surface md:text-6xl">
        Hola, <span className="text-primary font-black">{displayName}</span>.
      </h1>
      <div className="mt-5">
        {hasVideos ? (
          <DashboardHeroStats
            videoCount={videoCount}
            sectionCount={sectionCount}
          />
        ) : (
          <p className="font-body text-base font-medium text-on-surface-variant">
            Tu cerebro está vacío — empieza a llenarlo.
          </p>
        )}
      </div>
    </header>
  )
}
