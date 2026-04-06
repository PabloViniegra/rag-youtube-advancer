import type { Metadata } from 'next'
import { Suspense, ViewTransition } from 'react'

import { DashboardMainContent } from '@/components/dashboard/home/dashboard-main-content'
import { DashboardSkeleton } from '@/components/dashboard/home/skeletons'
import { getCurrentUser } from '@/lib/auth/actions'

export const metadata: Metadata = {
  title: 'Inicio — Dashboard',
}

/**
 * Dashboard home page — two-layer ViewTransition + Suspense streaming.
 *
 * Layer 1 (page navigation):
 *   The outer <ViewTransition> handles directional slides when the user
 *   navigates to/from this route. It fires at navigation time.
 *
 * Layer 2 (Suspense reveal):
 *   The inner <ViewTransition enter="slide-up"> fires when the async
 *   DashboardMainContent resolves — a separate, later transition that
 *   doesn't compete with layer 1.
 *
 * The skeleton is personalised: it shows "Hola, [name]." immediately
 * (from the JWT session cookie) while the Supabase query runs.
 *
 * Why async here?
 *   getCurrentUser() reads the session from the cookie — no DB round
 *   trip, resolves in ~5-10ms. Only the Supabase video query (inside
 *   DashboardMainContent) is the slow part, and that streams in via
 *   Suspense.
 */
export default async function DashboardPage() {
  const user = await getCurrentUser()

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0] ??
    'Creator'

  return (
    /*
     * Layer 1 — directional page transitions.
     * default="none" prevents this VT from firing on unrelated
     * transitions (Suspense reveals, background revalidations).
     */
    <ViewTransition
      enter={{
        'nav-forward': 'slide-from-right',
        'nav-back': 'slide-from-left',
        default: 'none',
      }}
      exit={{
        'nav-forward': 'slide-to-left',
        'nav-back': 'slide-to-right',
        default: 'none',
      }}
      default="none"
    >
      <Suspense
        fallback={
          /*
           * Skeleton exit animation — slides down as real content enters.
           * Simple string prop (not type-keyed map): Suspense resolves
           * fire without a transition type, so type maps would silently
           * fall back to `default` here.
           */
          <ViewTransition exit="slide-down" default="none">
            <DashboardSkeleton displayName={displayName} />
          </ViewTransition>
        }
      >
        {/*
         * Layer 2 — Suspense reveal animation.
         * Fires independently when DashboardMainContent resolves.
         * default="none" prevents it from firing during page navigation.
         */}
        <ViewTransition enter="slide-up" default="none">
          <DashboardMainContent
            userId={user?.id ?? ''}
            displayName={displayName}
          />
        </ViewTransition>
      </Suspense>
    </ViewTransition>
  )
}
