'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  /** Text to write to the clipboard */
  text: string
  /** Optional extra className for layout overrides */
  className?: string
  /** Accessible label — describes what is being copied */
  'aria-label'?: string
}

export function CopyButton({
  text,
  className,
  'aria-label': ariaLabel,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback silently — clipboard API may be restricted
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel ?? 'Copiar al portapapeles'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5',
        'font-body text-xs font-semibold transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        copied
          ? 'bg-secondary-container text-on-secondary-container'
          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
        className,
      )}
    >
      {copied ? (
        <>
          <CheckIcon />
          <span>¡Copiado!</span>
        </>
      ) : (
        <>
          <ClipboardIcon />
          <span>Copiar</span>
        </>
      )}
    </button>
  )
}

// ── Icons ───────────────────────────────────────────────────────────────────

function ClipboardIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
