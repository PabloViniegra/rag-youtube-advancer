'use client'

/**
 * BillingActions — interactive plan action buttons.
 * Separated so billing-section.tsx stays under 200 lines.
 */

import { useTransition } from 'react'
import {
  redirectToCheckout,
  redirectToPortal,
  redirectToUpgradeMax,
} from '@/lib/stripe/actions'
import type { PlanKey } from './billing-atoms'
import { StripeIcon } from './billing-atoms'

// ── Feature lists ─────────────────────────────────────────────────────────────

const PRO_FEATURES = [
  '25 videos indexados — 25× más que el plan Free',
  'Búsqueda ilimitada sobre transcripciones',
  'Reportes de inteligencia y resúmenes AI',
] as const

const MAX_FEATURES = [
  '100 videos indexados — cuatro veces el plan Pro',
  'Procesamiento prioritario en cola de ingesta',
  'Acceso anticipado a nuevas funciones',
] as const

// ── Components ────────────────────────────────────────────────────────────────

export function UpgradeToPro() {
  const [isPending, startTransition] = useTransition()

  function handleUpgrade() {
    startTransition(async () => {
      await redirectToCheckout()
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* /delight — feature list gives context to the upgrade decision */}
      <ul className="flex flex-col gap-2" aria-label="Qué incluye el plan Pro">
        {PRO_FEATURES.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5">
            <span className="mt-0.5 font-bold text-primary" aria-hidden="true">
              ✓
            </span>
            <span className="font-body text-sm text-on-surface-variant">
              {feat}
            </span>
          </li>
        ))}
      </ul>

      {/* /bolder — .btn-cta applies the traveling gradient + sonar ring from globals.css */}
      <button
        type="button"
        disabled={isPending}
        onClick={handleUpgrade}
        className="btn-cta inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-body text-sm font-semibold text-on-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <StripeIcon />
        {isPending ? 'Redirigiendo a Stripe…' : 'Actualizar a Pro — €5.99/mes'}
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
    <div className="flex flex-col gap-3">
      <p className="font-body text-sm leading-relaxed text-on-surface-variant">
        Gestiona tu método de pago, consulta tus facturas o cancela tu
        suscripción desde el portal de Stripe.
      </p>

      <button
        type="button"
        disabled={isPending}
        onClick={handleManage}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-outline bg-surface-container-high px-6 py-3 font-body text-sm font-semibold text-on-surface transition-colors duration-150 hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <StripeIcon />
        {isPending ? 'Abriendo portal…' : 'Gestionar suscripción'}
      </button>
    </div>
  )
}

export function UpgradeToMax() {
  const [isPending, startTransition] = useTransition()

  function handleUpgrade() {
    startTransition(async () => {
      await redirectToUpgradeMax()
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* /delight — feature list gives context to the upgrade decision */}
      <ul className="flex flex-col gap-2" aria-label="Qué incluye el plan Max">
        {MAX_FEATURES.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5">
            <span className="mt-0.5 font-bold text-tertiary" aria-hidden="true">
              ✓
            </span>
            <span className="font-body text-sm text-on-surface-variant">
              {feat}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={isPending}
        onClick={handleUpgrade}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-tertiary px-6 py-3.5 font-body text-sm font-semibold text-on-tertiary transition-opacity duration-150 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <StripeIcon />
        {isPending ? 'Redirigiendo a Stripe…' : 'Actualizar a Max — €15.99/mes'}
      </button>
    </div>
  )
}

interface PlanActionsProps {
  plan: PlanKey
}

export function PlanActions({ plan }: PlanActionsProps) {
  if (plan === 'max') return <ManageSubscription />
  if (plan === 'pro')
    return (
      <div className="flex flex-col gap-6">
        <UpgradeToMax />
        <ManageSubscription />
      </div>
    )
  if (plan === 'free') return <UpgradeToPro />
  return null
}
