'use client'

import { useTransition } from 'react'
import { dismissDigest } from '@/app/dashboard/home/actions/digest'
import { CloseIcon } from '@/components/dashboard/icons'

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
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant/60 transition-colors hover:bg-tertiary-container hover:text-on-tertiary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <CloseIcon />
    </button>
  )
}
