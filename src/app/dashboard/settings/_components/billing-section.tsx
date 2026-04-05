'use client'

import { useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { redirectToCheckout, redirectToPortal } from '@/lib/stripe/actions'

// ── Types ─────────────────────────────────────────────────────────────────────

const PLAN_LABEL = {
  admin: 'Admin',
  pro: 'Pro',
  free: 'Free',
} as const

type PlanKey = keyof typeof PLAN_LABEL

interface BillingSectionProps {
  plan: PlanKey
}

// ── Checkout feedback ─────────────────────────────────────────────────────────

const CHECKOUT_STATUS = {
  success: {
    text: 'Tu suscripcion Pro esta activa. Bienvenido.',
    variant: 'success',
  },
  cancelled: {
    text: 'Pago cancelado. Puedes intentarlo cuando quieras.',
    variant: 'neutral',
  },
  error: {
    text: 'Hubo un error al procesar el pago.',
    variant: 'error',
  },
} as const

type CheckoutKey = keyof typeof CHECKOUT_STATUS

function isCheckoutKey(value: string | null): value is CheckoutKey {
  return value !== null && value in CHECKOUT_STATUS
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BillingSection({ plan }: BillingSectionProps) {
  const searchParams = useSearchParams()
  const checkoutParam = searchParams.get('checkout')
  const feedback = isCheckoutKey(checkoutParam)
    ? CHECKOUT_STATUS[checkoutParam]
    : null
  const errorMessage = searchParams.get('message')

  return (
    <section
      aria-labelledby="billing-heading"
      className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-background p-6 shadow-sm"
    >
      <h2
        id="billing-heading"
        className="font-headline text-base font-bold text-on-surface"
      >
        Plan y facturacion
      </h2>

      {/* Current plan row */}
      <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-low px-4 py-3">
        <span className="font-body text-xs font-medium text-on-surface-variant">
          Plan actual
        </span>
        <PlanBadge plan={plan} />
      </div>

      {/* Checkout feedback banner */}
      {feedback ? (
        <FeedbackBanner
          variant={feedback.variant}
          text={
            feedback.variant === 'error' && errorMessage
              ? errorMessage
              : feedback.text
          }
        />
      ) : null}

      {/* Action area — varies by plan */}
      {plan === 'admin' ? <AdminNotice /> : null}
      {plan === 'pro' ? <ManageSubscription /> : null}
      {plan === 'free' ? <UpgradeToPro /> : null}
    </section>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AdminNotice() {
  return (
    <div className="rounded-xl bg-primary-container/40 px-5 py-4">
      <p className="font-body text-sm text-on-primary-container">
        Eres administrador — tienes acceso completo sin necesidad de
        suscripcion.
      </p>
    </div>
  )
}

function UpgradeToPro() {
  const [isPending, startTransition] = useTransition()

  function handleUpgrade() {
    startTransition(async () => {
      await redirectToCheckout()
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-outline-variant px-5 py-5">
      <p className="font-body text-sm leading-relaxed text-on-surface-variant">
        Desbloquea busqueda ilimitada, reportes de inteligencia y mas con el
        plan Pro.
      </p>

      <button
        type="button"
        disabled={isPending}
        onClick={handleUpgrade}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-body text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <StripeIcon />
        {isPending
          ? 'Redirigiendo a Stripe...'
          : 'Actualizar a Pro — $5.99/mes'}
      </button>
    </div>
  )
}

function ManageSubscription() {
  const [isPending, startTransition] = useTransition()

  function handleManage() {
    startTransition(async () => {
      await redirectToPortal()
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-outline-variant px-5 py-5">
      <p className="font-body text-sm leading-relaxed text-on-surface-variant">
        Gestiona tu metodo de pago, ve tus facturas o cancela tu suscripcion
        desde el portal de Stripe.
      </p>

      <button
        type="button"
        disabled={isPending}
        onClick={handleManage}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container px-6 py-3 font-body text-sm font-semibold text-on-surface transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <StripeIcon />
        {isPending ? 'Abriendo portal...' : 'Gestionar suscripcion'}
      </button>
    </div>
  )
}

// ── Atoms ─────────────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: PlanKey }) {
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

interface FeedbackBannerProps {
  variant: 'success' | 'neutral' | 'error'
  text: string
}

function FeedbackBanner({ variant, text }: FeedbackBannerProps) {
  const styles: Record<FeedbackBannerProps['variant'], string> = {
    success:
      'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300',
    neutral:
      'bg-surface-container border-outline-variant text-on-surface-variant',
    error:
      'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300',
  }

  return (
    <output
      className={`block rounded-xl border px-4 py-3 font-body text-sm ${styles[variant]}`}
    >
      {text}
    </output>
  )
}

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
