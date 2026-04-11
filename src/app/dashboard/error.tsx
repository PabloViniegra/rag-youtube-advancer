'use client'

/**
 * Dashboard error boundary.
 * Catches unhandled errors in /dashboard/* routes and renders a recovery UI.
 */

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error tracking (e.g. Sentry) here if needed
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error-container">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="text-error"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 8v4M12 16h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-headline text-xl font-bold text-on-surface">
          Algo salió mal
        </h2>
        <p className="font-body text-sm text-on-surface-variant max-w-sm">
          Ocurrió un error inesperado. Puedes intentar recargar la sección.
        </p>
      </div>

      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-body text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
