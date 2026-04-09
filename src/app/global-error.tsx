'use client'

import { useEffect } from 'react'

/**
 * Global error boundary — catches errors in root layout.
 * Must include its own <html> and <body> tags.
 */

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log to error tracking (e.g. Sentry) here if needed
    console.error('[global-error]', error)
  }, [error])
  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-background p-8 text-center">
        <div className="flex flex-col items-center gap-6">
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Error crítico
          </h1>
          <p className="font-body text-sm text-on-surface-variant max-w-sm">
            La aplicación encontró un error inesperado. Por favor recarga la
            página.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-primary px-5 py-2.5 font-body text-sm font-semibold text-on-primary"
          >
            Recargar
          </button>
        </div>
      </body>
    </html>
  )
}
