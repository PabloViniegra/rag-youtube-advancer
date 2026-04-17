'use client'

import { useTransition } from 'react'
import { redirectToCheckout } from '@/lib/stripe/actions'

export function UpgradeHeaderButton() {
  const [isPending, startTransition] = useTransition()

  function handleUpgrade() {
    startTransition(async () => {
      await redirectToCheckout()
    })
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleUpgrade}
      aria-label="Actualizar a plan Pro"
      className="btn-cta inline-flex h-11 items-center gap-2 rounded-xl px-5 font-body text-sm font-bold text-on-primary shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
    >
      <SparklesIcon />
      {isPending ? 'Redirigiendo…' : 'Actualizar a Pro'}
    </button>
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
