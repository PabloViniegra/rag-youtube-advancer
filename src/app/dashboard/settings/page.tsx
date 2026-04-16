import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense, ViewTransition } from 'react'
import type { PlanKey } from '@/lib/plans'
import { PLAN_LABEL, resolvePlan, videoLimitForPlan } from '@/lib/plans'
import { syncSubscriptionFromStripe } from '@/lib/stripe/sync'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { BillingSection } from './_components/billing-section'

export const metadata: Metadata = {
  title: 'Ajustes — Dashboard',
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Profile = Database['public']['Tables']['profiles']['Row']

// ── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AjustesPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/dashboard/settings')
  }

  const fetchProfile = () =>
    supabase
      .from('profiles')
      .select('id, email, role, stripe_customer_id, subscription_active')
      .eq('id', user.id)
      .maybeSingle()

  const { data: profileRaw } = await fetchProfile()
  let profile = profileRaw as unknown as Profile | null

  // ── Stripe sync on redirect ────────────────────────────────────────────────
  const params = await searchParams
  const checkout = typeof params.checkout === 'string' ? params.checkout : null
  const portal = typeof params.portal === 'string' ? params.portal : null

  const shouldSync =
    (checkout === 'success' && profile && !profile.subscription_active) ||
    portal === 'return'

  if (shouldSync && profile) {
    const result = await syncSubscriptionFromStripe({
      userId: user.id,
      email: profile.email ?? user.email,
      existingCustomerId: profile.stripe_customer_id,
      deactivateIfNotFound: portal === 'return',
    })

    if (result.synced) {
      const { data: freshRaw } = await fetchProfile()
      profile = freshRaw as unknown as Profile | null
    }
  }

  const plan = profile ? resolvePlan(profile) : 'free'
  const email = profile?.email ?? user.email ?? '—'

  // ── Video usage (onboard: muestra límites en tiempo real) ──────────────────
  let videoCount = 0
  if (plan !== 'admin') {
    const { count } = await supabase
      .from('videos')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    videoCount = count ?? 0
  }
  const videoLimit = videoLimitForPlan(plan)

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
      <div className="flex flex-col gap-8 max-w-2xl">
        {/* ── Page header ── */}
        <div className="flex flex-col gap-1">
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">
            Ajustes
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            Gestiona tu cuenta y plan de suscripción.
          </p>
        </div>

        {/* ── Mi cuenta ── */}
        <AccountSection
          email={email}
          plan={plan}
          videoCount={videoCount}
          videoLimit={videoLimit}
        />

        {/* ── Plan y facturación ── */}
        <Suspense fallback={<BillingSkeleton />}>
          <BillingSection plan={plan} />
        </Suspense>
      </div>
    </ViewTransition>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface AccountSectionProps {
  email: string
  plan: PlanKey
  videoCount: number
  videoLimit: number
}

function AccountSection({
  email,
  plan,
  videoCount,
  videoLimit,
}: AccountSectionProps) {
  const isUnlimited = videoLimit === Infinity
  const usagePct = isUnlimited ? 0 : Math.min(videoCount / videoLimit, 1)
  const showUsage = plan !== 'admin'

  const barColor =
    usagePct >= 1
      ? 'var(--color-error)'
      : usagePct >= 0.75
        ? 'var(--color-secondary)'
        : 'var(--color-primary)'

  return (
    <section
      aria-labelledby="account-heading"
      className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-background p-6 shadow-sm"
    >
      <h2
        id="account-heading"
        className="font-headline text-base font-bold text-on-surface"
      >
        Mi cuenta
      </h2>

      <div className="flex flex-col gap-3">
        {/* Email row */}
        <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-low px-4 py-3">
          <span className="font-body text-xs font-medium text-on-surface-variant">
            Correo electrónico
          </span>
          <span className="font-body text-sm font-semibold text-on-surface truncate max-w-xs">
            {email}
          </span>
        </div>

        {/* Role row */}
        <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-low px-4 py-3">
          <span className="font-body text-xs font-medium text-on-surface-variant">
            Rol
          </span>
          <RoleBadge plan={plan} />
        </div>

        {/* Usage row — free / pro / max only */}
        {showUsage && (
          <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-body text-xs font-medium text-on-surface-variant">
                Videos indexados
              </span>
              {isUnlimited ? (
                <span className="font-body text-xs font-semibold text-primary">
                  Ilimitado
                </span>
              ) : (
                <span
                  className="font-body text-xs font-semibold tabular-nums"
                  style={{
                    color:
                      usagePct >= 1
                        ? 'var(--color-error)'
                        : 'var(--color-on-surface)',
                  }}
                >
                  {videoCount}
                  <span className="font-normal text-on-surface-variant">
                    {' '}
                    / {videoLimit}
                  </span>
                </span>
              )}
            </div>
            {!isUnlimited && (
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high"
                role="progressbar"
                aria-valuenow={videoCount}
                aria-valuemax={videoLimit}
                aria-label="Uso de videos"
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${usagePct * 100}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

// ── BillingSkeleton — Suspense fallback ───────────────────────────────────────

function BillingSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-background p-6 shadow-sm"
    >
      <div className="h-5 w-40 rounded-lg bg-surface-container-high animate-pulse" />
      <div className="h-12 w-full rounded-xl bg-surface-container-low animate-pulse" />
      <div className="flex flex-col gap-3 pt-1">
        <div className="h-4 w-3/4 rounded-full bg-surface-container-high animate-pulse" />
        <div className="h-4 w-1/2 rounded-full bg-surface-container-high animate-pulse" />
        <div className="mt-2 h-12 w-full rounded-xl bg-surface-container-high animate-pulse opacity-60" />
      </div>
    </div>
  )
}

// ── Atoms ─────────────────────────────────────────────────────────────────────

function RoleBadge({ plan }: { plan: PlanKey }) {
  const styles: Record<PlanKey, string> = {
    admin:
      'bg-primary-container text-on-primary-container border border-primary/20',
    max: 'bg-tertiary-container text-on-tertiary-container border border-tertiary/20',
    pro: 'bg-secondary-container text-on-secondary-container border border-secondary/20',
    free: 'bg-surface-container text-on-surface-variant border border-outline-variant',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-0.5 font-body text-xs font-semibold ${styles[plan]}`}
    >
      {PLAN_LABEL[plan]}
    </span>
  )
}
