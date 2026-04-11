'use client'

import { AnimatedCounter } from './animated-counter'

interface DashboardHeroStatsProps {
  videoCount: number
  sectionCount: number
}

export function DashboardHeroStats({
  videoCount,
  sectionCount,
}: DashboardHeroStatsProps) {
  return (
    <>
      <AnimatedCounter target={videoCount} />{' '}
      {videoCount === 1 ? 'video indexado' : 'videos indexados'} ·{' '}
      <AnimatedCounter target={sectionCount} delay={150} /> fragmentos en
      memoria
    </>
  )
}
