import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense, ViewTransition } from 'react'
import type { PlanKey } from '@/lib/plans'
import { PLAN_LABEL, resolvePlan } from '@/lib/plans'
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
  // Two cases where the page must re-verify with Stripe instead of trusting
  // only the DB (webhooks are async and may not have fired yet):
  //
  //   ?checkout=success  — user just paid; activate if Stripe confirms.
  //   ?portal=return     — user returned from the portal; sync whatever changed
  //                        (cancellation, reactivation, plan change).
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
      // On portal return, also deactivate if Stripe shows no active subscription.
      deactivateIfNotFound: portal === 'return',
    })

    if (result.synced) {
      // Re-fetch to pick up the updated subscription_active / role / stripe_customer_id.
      const { data: freshRaw } = await fetchProfile()
      profile = freshRaw as unknown as Profile | null
    }
  }

  const plan = profile ? resolvePlan(profile) : 'free'
  const email = profile?.email ?? user.email ?? '—'

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
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">
            Ajustes
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            Gestiona tu cuenta y plan de suscripcion.
          </p>
        </div>

        {/* ── Mi cuenta ── */}
        <AccountSection email={email} plan={plan} />

        {/* ── Plan y facturacion ── */}
        <Suspense fallback={null}>
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
}

function AccountSection({ email, plan }: AccountSectionProps) {
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
            Correo electronico
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
      </div>
    </section>
  )
}

// ── Atoms ─────────────────────────────────────────────────────────────────────

function RoleBadge({ plan }: { plan: PlanKey }) {
  const styles: Record<PlanKey, string> = {
    admin:
      'bg-primary-container text-on-primary-container border border-primary/20',
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
