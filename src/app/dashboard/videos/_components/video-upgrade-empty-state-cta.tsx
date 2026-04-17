'use client'

import { useTransition } from 'react'
import { redirectToCheckout } from '@/lib/stripe/actions'

const PRO_FEATURES = [
  '25 videos indexados — 25× más que el plan Free',
  'Búsqueda semántica ilimitada',
  'Reportes de inteligencia AI',
] as const

export function UpgradeEmptyStateCta() {
  const [isPending, startTransition] = useTransition()

  function handleUpgrade() {
    startTransition(async () => {
      await redirectToCheckout()
    })
  }

  return (
    <div className="flex flex-col gap-5">
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

      <button
        type="button"
        disabled={isPending}
        onClick={handleUpgrade}
        aria-label="Actualizar a plan Pro"
        className="btn-cta inline-flex w-fit h-11 items-center gap-2 rounded-xl px-6 font-body text-sm font-bold text-on-primary shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SparklesIcon />
        {isPending ? 'Redirigiendo…' : 'Pasar a Pro'}
      </button>
    </div>
  )
}

function SparklesIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
