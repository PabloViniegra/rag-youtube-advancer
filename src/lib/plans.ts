// Plan definitions — single source of truth for plan resolution, limits and labels.
// const-first pattern, flat interfaces, no `any`.

import type { Database } from '@/lib/supabase/types'

// ── Plan keys ─────────────────────────────────────────────────────────────────

export const PLAN = {
  ADMIN: 'admin',
  PRO: 'pro',
  FREE: 'free',
} as const

export type PlanKey = (typeof PLAN)[keyof typeof PLAN]

// ── Labels (Spanish UI) ───────────────────────────────────────────────────────

export const PLAN_LABEL: Record<PlanKey, string> = {
  [PLAN.ADMIN]: 'Admin',
  [PLAN.PRO]: 'Pro',
  [PLAN.FREE]: 'Free',
} as const

// ── Limits ────────────────────────────────────────────────────────────────────

/** Maximum videos a free-tier user can index (trial). */
export const FREE_VIDEO_LIMIT = 1

/** Pro and Admin have no video cap. */
export const PRO_VIDEO_LIMIT = Infinity

// ── Helpers ───────────────────────────────────────────────────────────────────

type Profile = Database['public']['Tables']['profiles']['Row']

/** Resolve a profile row to a PlanKey. */
export function resolvePlan(
  profile: Pick<Profile, 'role' | 'subscription_active'>,
): PlanKey {
  if (profile.role === 'admin') return PLAN.ADMIN
  if (profile.subscription_active) return PLAN.PRO
  return PLAN.FREE
}

/** Return the video limit for a given plan. */
export function videoLimitForPlan(plan: PlanKey): number {
  if (plan === PLAN.FREE) return FREE_VIDEO_LIMIT
  return PRO_VIDEO_LIMIT
}

/** Check whether a user can index another video given their current count. */
export function canIndexVideo(plan: PlanKey, currentCount: number): boolean {
  const limit = videoLimitForPlan(plan)
  return currentCount < limit
}
