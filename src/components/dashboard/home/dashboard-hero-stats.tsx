'use client'

import { AnimatedCounter } from './animated-counter'

interface DashboardHeroStatsProps {
  videoCount: number
  sectionCount: number
}

interface StatItemProps {
  value: number
  label: string
  delay?: number
}

function StatItem({ value, label, delay = 0 }: StatItemProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-headline text-4xl font-black leading-none tabular-nums text-on-surface md:text-5xl">
        <AnimatedCounter target={value} delay={delay} />
      </span>
      <span className="font-label text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
    </div>
  )
}

export function DashboardHeroStats({
  videoCount,
  sectionCount,
}: DashboardHeroStatsProps) {
  return (
    <div className="flex items-end gap-8">
      <StatItem
        value={videoCount}
        label={videoCount === 1 ? 'video indexado' : 'videos indexados'}
      />
      <div className="mb-1 h-8 w-px bg-outline-variant" aria-hidden="true" />
      <StatItem value={sectionCount} label="segmentos en memoria" delay={150} />
    </div>
  )
}
