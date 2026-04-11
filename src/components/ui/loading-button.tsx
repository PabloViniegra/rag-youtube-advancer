'use client'

/**
 * LoadingButton
 *
 * A button that shows an inline CSS spinner when `isLoading` is true.
 * Uses a pure-CSS border-top spinner — no SVG dependency.
 * Preserves min-width to prevent layout shift during loading.
 *
 * Respects `prefers-reduced-motion`: spinner opacity is reduced instead of
 * stopping the animation entirely so the loading state remains perceivable.
 */

import { type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-3 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin motion-reduce:opacity-50"
    />
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LoadingButton({
  isLoading,
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  const isDisabled = isLoading || disabled

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      aria-label={isLoading ? 'Procesando...' : props['aria-label']}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        isLoading && 'opacity-85',
        className,
      )}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  )
}
