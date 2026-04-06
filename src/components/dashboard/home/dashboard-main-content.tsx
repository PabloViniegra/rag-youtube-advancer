import { getDashboardData } from '@/lib/queries/dashboard'

import { BrainStatus } from './brain-status'
import { ContextualTip } from './contextual-tip'
import { DashboardHero } from './dashboard-hero'
import { OnboardingSteps } from './onboarding-steps'
import { QuickActions } from './quick-actions'
import { RecentVideos } from './recent-videos'

interface DashboardMainContentProps {
  userId: string
  displayName: string
}

/**
 * Async Server Component — does the single Supabase query and renders
 * the full dashboard body. Wrapped in <Suspense> by page.tsx so the
 * skeleton shows immediately while this resolves.
 *
 * getDashboardData() is wrapped in React.cache(), so if other Server
 * Components on the same request also call it, the query only runs once.
 */
export async function DashboardMainContent({
  userId,
  displayName,
}: DashboardMainContentProps) {
  const { videoCount, sectionCount, recentVideos } =
    await getDashboardData(userId)

  const hasVideos = videoCount > 0

  return (
    <div className="flex flex-col gap-8">
      <DashboardHero
        displayName={displayName}
        videoCount={videoCount}
        sectionCount={sectionCount}
        hasVideos={hasVideos}
      />

      <QuickActions hasVideos={hasVideos} />

      <BrainStatus videoCount={videoCount} />

      {/* Returns null when videoCount === 0 */}
      <ContextualTip videoCount={videoCount} />

      {hasVideos ? <RecentVideos videos={recentVideos} /> : <OnboardingSteps />}
    </div>
  )
}
