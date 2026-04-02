import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

export const metadata: Metadata = {
  title: 'Ajustes — Dashboard',
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Profile = Database['public']['Tables']['profiles']['Row']

const PLAN_LABEL = {
  admin: 'Admin',
  pro: 'Pro',
  free: 'Free',
} as const

type PlanKey = keyof typeof PLAN_LABEL

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolvePlan(profile: Profile): PlanKey {
  if (profile.role === 'admin') return 'admin'
  if (profile.subscription_active) return 'pro'
  return 'free'
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AjustesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/dashboard/settings')
  }

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('id, email, role, stripe_customer_id, subscription_active')
    .eq('id', user.id)
    .maybeSingle()

  // supabase-js infers `data` as `never` in strict TS when select() columns
  // don't exactly match the generated Row type — cast via unknown to Profile.
  const profile = profileRaw as unknown as Profile | null

  const plan = profile ? resolvePlan(profile) : 'free'
  const email = profile?.email ?? user.email ?? '—'

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">
          Ajustes
        </h1>
        <p className="font-body text-sm text-on-surface-variant">
          Gestiona tu cuenta y plan de suscripción.
        </p>
      </div>

      {/* ── Mi cuenta ── */}
      <AccountSection email={email} plan={plan} />

      {/* ── Plan y facturación ── */}
      <BillingSection plan={plan} />
    </div>
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
      </div>
    </section>
  )
}

interface BillingSectionProps {
  plan: PlanKey
}

function BillingSection({ plan }: BillingSectionProps) {
  return (
    <section
      aria-labelledby="billing-heading"
      className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-background p-6 shadow-sm"
    >
      <h2
        id="billing-heading"
        className="font-headline text-base font-bold text-on-surface"
      >
        Plan y facturación
      </h2>

      {/* Current plan row */}
      <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-low px-4 py-3">
        <span className="font-body text-xs font-medium text-on-surface-variant">
          Plan actual
        </span>
        <RoleBadge plan={plan} />
      </div>

      {/* Coming soon stripe block */}
      <div className="flex flex-col gap-4 rounded-xl border border-dashed border-outline-variant px-5 py-5">
        <div className="flex items-center gap-2">
          <ComingSoonChip />
          <span className="font-body text-xs text-on-surface-variant">
            Pagos con Stripe — próximamente disponible
          </span>
        </div>

        <p className="font-body text-sm leading-relaxed text-on-surface-variant">
          Pronto podrás gestionar tu suscripción, ver facturas y actualizar tu
          método de pago directamente desde aquí.
        </p>

        {/* Disabled upgrade button */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-body text-sm font-semibold text-on-primary opacity-40 cursor-not-allowed select-none"
        >
          <StripeIcon />
          Actualizar a Pro — $5/mes
        </button>
      </div>
    </section>
  )
}

// ── Atoms ─────────────────────────────────────────────────────────────────────

interface RoleBadgeProps {
  plan: PlanKey
}

function RoleBadge({ plan }: RoleBadgeProps) {
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

function ComingSoonChip() {
  return (
    <span className="inline-flex items-center rounded-full bg-secondary-container px-2.5 py-0.5 font-body text-xs font-semibold text-on-secondary-container">
      Próximamente
    </span>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function StripeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M2 10h20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
