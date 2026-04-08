'use client'

import { useTransition } from 'react'
import { dismissDigest } from '@/app/dashboard/home/actions/digest'

interface WeeklyDigestDismissButtonProps {
  digestId: string
}

export function WeeklyDigestDismissButton({
  digestId,
}: WeeklyDigestDismissButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleDismiss() {
    startTransition(async () => {
      await dismissDigest(digestId)
    })
  }

  return (
    <button
      type="button"
      onClick={handleDismiss}
      disabled={isPending}
      aria-label="Cerrar resumen semanal"
      className="rounded p-1 text-on-surface-variant opacity-60 transition-opacity hover:opacity-100 disabled:cursor-not-allowed"
    >
      ✕
    </button>
  )
}
