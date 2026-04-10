'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useCookieConsent } from './use-cookie-consent'

// ─── Icons ────────────────────────────────────────────────────────────────────

function CookieIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Cookie outline */}
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
      {/* Chocolate chips */}
      <path d="M8.5 8.5v.01" />
      <path d="M16 15.5v.01" />
      <path d="M12 12v.01" />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CookieConsent() {
  const { showBanner, accept, decline } = useCookieConsent()
  const acceptRef = useRef<HTMLButtonElement>(null)

  // Move focus to the primary action when the banner appears
  useEffect(() => {
    if (showBanner) {
      acceptRef.current?.focus()
    }
  }, [showBanner])

  if (!showBanner) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      aria-describedby="cookie-banner-description"
      className={cn(
        'fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl',
        'rounded-2xl border border-outline-variant bg-surface-container shadow-lg',
        'animate-fade-up',
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
        {/* Icon + copy */}
        <div className="flex flex-1 items-start gap-3">
          <CookieIcon className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-on-surface">
              We use cookies
            </p>
            <p
              id="cookie-banner-description"
              className="text-sm leading-relaxed text-on-surface-variant"
            >
              We use cookies to improve your experience and analyse site usage.
              You can accept or decline non-essential cookies.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2">
          <button
            ref={acceptRef}
            type="button"
            onClick={accept}
            className={cn(
              'rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary',
              'transition-colors hover:bg-primary-dim',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container',
            )}
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={decline}
            className={cn(
              'rounded-xl border border-outline px-4 py-2 text-sm font-semibold text-on-surface',
              'transition-colors hover:bg-surface-variant',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container',
            )}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
