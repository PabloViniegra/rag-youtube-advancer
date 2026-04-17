import type { Metadata } from 'next'
import { cacheLife, cacheTag } from 'next/cache'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ViewTransition } from 'react'
import { canIndexVideo, PLAN, resolvePlan } from '@/lib/plans'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { UpgradeHeaderButton } from './_components/video-upgrade-header-button'
import { VideosPageClient } from './_components/videos-page-client'

type VideoRow = Database['public']['Tables']['videos']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export const metadata: Metadata = {
  title: 'Mis videos — Dashboard',
}

/**
 * Fetches the authenticated user's video list with per-user caching.
 * Tagged with `dashboard-{userId}` so server actions can call updateTag()
 * to invalidate immediately after mutations (add / delete video).
 *
 * Uses 'use cache: private' to allow the Supabase auth cookie context
 * required by createClient() while still caching the result.
 */
async function getUserVideos(userId: string): Promise<VideoRow[]> {
  'use cache: private'
  cacheTag(`dashboard-${userId}`)
  cacheLife('minutes')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('videos')
    .select('id, youtube_id, title, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (error || !data ? [] : data) as VideoRow[]
}

async function getUserProfile(
  userId: string,
): Promise<Pick<Profile, 'role' | 'subscription_active' | 'trial_used'> | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('role, subscription_active, trial_used')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as unknown as Pick<
    Profile,
    'role' | 'subscription_active' | 'trial_used'
  >
}

export default async function VideosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/dashboard/videos')
  }

  const [videoList, profile] = await Promise.all([
    getUserVideos(user.id),
    getUserProfile(user.id),
  ])

  const count = videoList.length
  const plan = profile ? resolvePlan(profile) : PLAN.FREE
  const trialUsed = profile?.trial_used ?? false
  const canIndex = canIndexVideo(plan, count, trialUsed)

  return (
    <ViewTransition
      enter={{
        'nav-forward': 'slide-from-right',
        'nav-back': 'slide-from-left',
        default: 'slide-up',
      }}
      exit={{
        'nav-forward': 'slide-to-left',
        'nav-back': 'slide-to-right',
        default: 'none',
      }}
      default="none"
    >
      <div className="flex flex-col gap-8">
        {/* ── Page header — editorial bold treatment ── */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant pb-6">
          <div className="flex min-w-0 flex-col gap-1.5">
            {/* Overline */}
            <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary">
              Segundo cerebro
            </span>
            {/* Display headline */}
            <h1 className="font-headline text-3xl font-extrabold leading-tight text-on-surface md:text-4xl">
              Mis videos
            </h1>
            {/* Subline — data as copy */}
            <p className="font-body text-sm text-on-surface-variant">
              {count > 0
                ? `${count} video${count === 1 ? '' : 's'} indexado${count === 1 ? '' : 's'} en tu base de conocimiento`
                : 'Indexa videos de YouTube y conviértelos en conocimiento consultable'}
            </p>
          </div>

          {canIndex ? (
            <Link
              href="/dashboard/videos/new"
              transitionTypes={['nav-forward']}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-body text-sm font-bold text-on-primary shadow-sm transition-all hover:bg-primary-dim active:scale-[0.98]"
            >
              <PlusIcon />
              Añadir video
            </Link>
          ) : (
            <UpgradeHeaderButton />
          )}
        </div>

        {/* ── Content ── */}
        <VideosPageClient initialVideos={videoList} canIndex={canIndex} />
      </div>
    </ViewTransition>
  )
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
