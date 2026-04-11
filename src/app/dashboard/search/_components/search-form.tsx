'use client'

/**
 * SearchForm — /distill + /delight
 *
 * /distill:  Lives directly on the page surface — no card wrapper.
 * /delight:  Ctrl+Enter submits; example-question chips shown in idle state.
 */

import type { AugmentApiErrorCode } from '@/lib/augmentation/types'
import { ErrorBanner } from './error-banner'

// ── Constants ─────────────────────────────────────────────────────────────────

export const EXAMPLE_QUESTIONS = [
  'Resúmeme este video en 5 puntos clave.',
  'Dame 3 ideas principales del video.',
  'Dame un título más atractivo basado en el contenido.',
] as const

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SearchFormError {
  message: string
  code?: AugmentApiErrorCode
}

export interface SearchFormProps {
  query: string
  onQueryChange: (value: string) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  showExamples: boolean
  error: SearchFormError | null
  onSuggestionClick: (suggestion: string) => void
}

// ── SearchInput ───────────────────────────────────────────────────────────────

function SearchInput({
  value,
  onChange,
  disabled,
  error,
}: {
  value: string
  onChange: (v: string) => void
  disabled: boolean
  error: SearchFormError | null
}) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
  }

  const isInvalid = error !== null
  const errorId = 'search-query-error'
  const hintId = 'search-query-hint'

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="search-query"
        className="font-body text-xs font-semibold text-on-surface-variant"
      >
        Tu pregunta{' '}
        <span aria-hidden="true" className="text-error">
          *
        </span>
      </label>
      <textarea
        id="search-query"
        rows={3}
        required
        placeholder="¿Qué explica el video sobre inteligencia artificial?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-invalid={isInvalid ? 'true' : undefined}
        aria-describedby={`${hintId} ${error ? errorId : ''}`}
        className="w-full resize-none rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <p id={hintId} className="font-body text-xs text-on-surface-variant">
        Busca en todos tus videos a la vez.
      </p>
      {error && (
        // aria-describedby target — ErrorBanner is the live region (role="alert")
        <p id={errorId} className="font-body text-xs text-error">
          {error.message}
        </p>
      )}
    </div>
  )
}

// ── ExampleQuestions ──────────────────────────────────────────────────────────

function ExampleQuestions({
  onExampleClick,
  questions = EXAMPLE_QUESTIONS,
}: {
  onExampleClick: (s: string) => void
  questions?: readonly string[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <p
        id="examples-label"
        className="font-body text-xs text-on-surface-variant"
      >
        Ideas para empezar:
      </p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onExampleClick(q)}
            className="inline-flex min-h-[24px] min-w-[24px] items-center rounded-full border border-outline-variant bg-surface-container-low px-3 py-1.5 font-body text-xs font-medium text-on-surface transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── SearchForm ────────────────────────────────────────────────────────────────

export function SearchForm({
  query,
  onQueryChange,
  onSubmit,
  isLoading,
  showExamples,
  error,
  onSuggestionClick,
}: SearchFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4"
      noValidate
      data-search-form
    >
      <SearchInput
        value={query}
        onChange={onQueryChange}
        disabled={isLoading}
        error={error}
      />

      {showExamples && <ExampleQuestions onExampleClick={onSuggestionClick} />}

      {error && (
        <ErrorBanner error={error} onSuggestionClick={onSuggestionClick} />
      )}

      <div className="flex flex-col gap-1.5">
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-body text-sm font-semibold text-on-primary transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Buscar
        </button>
        <p className="text-center font-body text-xs text-on-surface-variant">
          Ctrl + Enter para buscar
        </p>
      </div>
    </form>
  )
}
