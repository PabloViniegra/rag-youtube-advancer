'use client'

import { useSearchParams } from 'next/navigation'
import { AdminNotice, FeedbackBanner, PlanBadge } from './billing-atoms'
import type { PlanKey } from './billing-atoms'
import { PlanActions } from './billing-actions'

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

interface BillingSectionProps {
  plan: PlanKey
}

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
      <PlanActions plan={plan} />
    </section>
  )
}
