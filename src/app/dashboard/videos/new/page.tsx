import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ViewTransition } from 'react'
import { canIndexVideo, PLAN, resolvePlan } from '@/lib/plans'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { NewVideoOrchestrator } from './_components/new-video-orchestrator'
import { PipelineHint } from './_components/pipeline-hint'

type Profile = Database['public']['Tables']['profiles']['Row']

export const metadata: Metadata = {
  title: 'Añadir video',
  robots: { index: false, follow: false },
}

/**
 * /dashboard/videos/new
 *
 * Server Component shell:
 *  - Guards against trial-exhausted free users (redirects to /dashboard/videos)
 *  - Static hero section (SSR'd instantly)
 *  - NewVideoOrchestrator (client) handles form state + ingest action
 */

export default async function NuevoVideoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/dashboard/videos/new')
  }

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('role, subscription_active, trial_used')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as unknown as Pick<
    Profile,
    'role' | 'subscription_active' | 'trial_used'
  > | null

  const plan = profile ? resolvePlan(profile) : PLAN.FREE
  const trialUsed = profile?.trial_used ?? false

  // Fetch count for non-free plans (needed for canIndexVideo)
  const { count } = await supabase
    .from('videos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const videoCount = count ?? 0
  const canIndex = canIndexVideo(plan, videoCount, trialUsed)

  if (!canIndex && plan === PLAN.FREE) {
    redirect('/dashboard/videos')
  }

  return (
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
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
        {/* ── Hero (static, SSR'd) ── */}
        <header className="flex flex-col gap-4 animate-fade-up">
          <p className="font-headline text-xs font-bold uppercase tracking-widest text-primary">
            Segunda Mente
          </p>
          <h1 className="font-headline text-3xl font-extrabold leading-tight text-on-surface">
            Añadir video
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            Pega la URL de un video de YouTube para indexarlo. Lo analizamos en
            seis pasos automáticos:
          </p>
          <PipelineHint />
        </header>

        {/* ── Ingestion form (client) ── */}
        <NewVideoOrchestrator />
      </div>
    </ViewTransition>
  )
}
