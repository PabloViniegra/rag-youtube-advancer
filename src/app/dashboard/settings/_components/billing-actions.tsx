'use client'

/**
 * BillingActions — interactive plan action buttons.
 * Separated so billing-section.tsx stays under 200 lines.
 */

import { useTransition } from 'react'
import { redirectToCheckout, redirectToPortal } from '@/lib/stripe/actions'
import type { PlanKey } from './billing-atoms'
import { StripeIcon } from './billing-atoms'

// ── Components ────────────────────────────────────────────────────────────────

export function UpgradeToPro() {
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

export function ManageSubscription() {
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

interface PlanActionsProps {
  plan: PlanKey
}

export function PlanActions({ plan }: PlanActionsProps) {
  if (plan === 'pro') return <ManageSubscription />
  if (plan === 'free') return <UpgradeToPro />
  return null
}
