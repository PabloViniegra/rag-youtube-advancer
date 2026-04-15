/**
 * Billing atoms — pure presentational sub-components.
 * No client hooks; safe for import from both Server and Client components.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export const PLAN_LABEL = {
  admin: 'Admin',
  max: 'Max',
  pro: 'Pro',
  free: 'Free',
} as const

export type PlanKey = keyof typeof PLAN_LABEL

// ── Atoms ─────────────────────────────────────────────────────────────────────

export function AdminNotice() {
  return (
    <div className="rounded-xl bg-primary-container/40 px-5 py-4">
      <p className="font-body text-sm text-on-primary-container">
        Eres administrador — tienes acceso completo sin necesidad de
        suscripción.
      </p>
    </div>
  )
}

export function PlanBadge({ plan }: { plan: PlanKey }) {
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

export interface FeedbackBannerProps {
  variant: 'success' | 'neutral' | 'error'
  text: string
}

// /normalize — uses design tokens exclusively; no hardcoded Tailwind color classes.
// Dark mode handled automatically via CSS variable inversion in .dark.
export function FeedbackBanner({ variant, text }: FeedbackBannerProps) {
  const styles: Record<FeedbackBannerProps['variant'], string> = {
    success:
      'bg-primary-container/40 border-primary/20 text-on-primary-container',
    neutral:
      'bg-surface-container border-outline-variant text-on-surface-variant',
    error:
      'bg-error-container border-error/20 text-on-error-container',
  }

  return (
    <output
      className={`block rounded-xl border px-4 py-3 font-body text-sm ${styles[variant]}`}
    >
      {text}
    </output>
  )
}

export function StripeIcon() {
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
