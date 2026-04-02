'use client'

/**
 * ErrorBanner — inline error state for the search form.
 * Shows a plain-language error message and optional suggestion chips.
 */

import { AUGMENT_API_ERROR } from '@/lib/augmentation/types'
import type { SearchFormError } from './search-form'
import { EXAMPLE_QUESTIONS } from './search-form'

interface ErrorBannerProps {
  error: SearchFormError
  onSuggestionClick: (s: string) => void
}

export function ErrorBanner({ error, onSuggestionClick }: ErrorBannerProps) {
  const suggestions =
    error.code === AUGMENT_API_ERROR.NO_CONTEXT ? EXAMPLE_QUESTIONS : undefined

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-error/30 bg-error-container px-4 py-3"
    >
      <AlertIcon />
      <div className="flex w-full flex-col gap-3">
        <p className="font-body text-sm text-on-error-container">
          {error.message}
        </p>
        {suggestions && (
          <div className="flex flex-col gap-2">
            <p className="font-body text-xs font-semibold text-on-error-container/80">
              Prueba con:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSuggestionClick(s)}
                  className="inline-flex items-center rounded-full border border-error/30 bg-background px-3 py-1.5 font-body text-xs font-medium text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AlertIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 shrink-0 text-error"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 8v4M12 16h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
