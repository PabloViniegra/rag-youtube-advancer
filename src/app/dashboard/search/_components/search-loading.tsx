'use client'

/**
 * SearchLoading — /delight
 *
 * Replaces the static "Buscando respuesta…" with rotating creator-specific
 * messages that cycle every 2 s to reduce perceived wait time.
 */

import { useEffect, useState } from 'react'

const LOADING_MESSAGES = [
  'Buscando en tus videos…',
  'Analizando el contexto…',
  'Generando tu respuesta…',
] as const

export function SearchLoading() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      aria-live="polite"
      className="flex items-center justify-center gap-3 py-8"
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-outline-variant border-t-primary"
      />
      <p className="font-body text-sm text-on-surface-variant">
        {LOADING_MESSAGES[idx]}
      </p>
    </div>
  )
}
