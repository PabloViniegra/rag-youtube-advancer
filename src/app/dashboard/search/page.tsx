'use client'

/**
 * /dashboard/search
 *
 * Search / Q&A UI — Client Component.
 * Calls POST /api/augment with { query } and renders the AI answer + sources.
 */

import { useState } from 'react'
import type {
  AugmentErrorResponse,
  AugmentSuccessResponse,
} from '@/lib/augmentation/types'
import { AUGMENT_DEFAULTS } from '@/lib/augmentation/types'
import type { VideoSectionMatch } from '@/lib/retrieval/types'

// ── UI state ──────────────────────────────────────────────────────────────────

const SEARCH_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const

type SearchState = (typeof SEARCH_STATE)[keyof typeof SEARCH_STATE]

interface SuccessPayload {
  answer: string
  sources: VideoSectionMatch[]
  sourceCount: number
}

interface ErrorPayload {
  message: string
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface SearchInputProps {
  value: string
  onChange: (v: string) => void
  disabled: boolean
}

function SearchInput({ value, onChange, disabled }: SearchInputProps) {
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
        disabled={disabled}
        aria-describedby="search-query-hint"
        className="w-full resize-none rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <p
        id="search-query-hint"
        className="font-body text-xs text-on-surface-variant"
      >
        Busca en todos tus videos indexados a la vez.
      </p>
    </div>
  )
}

function SearchButton({ disabled }: { disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-body text-sm font-semibold text-on-primary transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Buscar
    </button>
  )
}

function LoadingSpinner() {
  return (
    <div
      aria-live="polite"
      className="flex items-center justify-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-6 py-8"
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-outline-variant border-t-primary"
      />
      <p className="font-body text-sm text-on-surface-variant">
        Buscando respuesta…
      </p>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-error/30 bg-error-container px-4 py-3"
    >
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
      <p className="font-body text-sm text-on-error-container">{message}</p>
    </div>
  )
}

interface SourceCardProps {
  source: VideoSectionMatch
  index: number
}

function SourceCard({ source, index }: SourceCardProps) {
  const similarityPct = Math.round(source.similarity * 100)
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-body text-xs font-semibold text-on-surface-variant">
          Fuente {index + 1}
        </span>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-body text-xs font-semibold text-primary">
          <span className="sr-only">Similitud: </span>
          {similarityPct}%
        </span>
      </div>
      <p className="line-clamp-3 font-body text-sm text-on-surface">
        {source.content}
      </p>
    </li>
  )
}

interface AnswerCardProps {
  data: SuccessPayload
}

function AnswerCard({ data }: AnswerCardProps) {
  return (
    <section aria-labelledby="answer-heading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant bg-background p-6 shadow-sm">
        <h2
          id="answer-heading"
          className="font-body text-xs font-semibold uppercase tracking-wide text-on-surface-variant"
        >
          Respuesta
        </h2>
        <p className="whitespace-pre-wrap font-body text-sm leading-relaxed text-on-surface">
          {data.answer}
        </p>
      </div>

      {data.sources.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-body text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Fragmentos usados como contexto ({data.sourceCount})
          </h3>
          <ol className="flex flex-col gap-2">
            {data.sources.map((source, i) => (
              <SourceCard key={source.id} source={source} index={i} />
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [searchState, setSearchState] = useState<SearchState>(SEARCH_STATE.IDLE)
  const [successData, setSuccessData] = useState<SuccessPayload | null>(null)
  const [errorData, setErrorData] = useState<ErrorPayload | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!query.trim()) return

    setSearchState(SEARCH_STATE.LOADING)
    setSuccessData(null)
    setErrorData(null)

    try {
      const res = await fetch('/api/augment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          matchThreshold: AUGMENT_DEFAULTS.matchThreshold,
          matchCount: AUGMENT_DEFAULTS.matchCount,
        }),
      })

      if (res.ok) {
        const data = (await res.json()) as AugmentSuccessResponse
        setSuccessData({
          answer: data.answer,
          sources: data.sources,
          sourceCount: data.sourceCount,
        })
        setSearchState(SEARCH_STATE.SUCCESS)
      } else {
        const errData = (await res.json()) as AugmentErrorResponse
        setErrorData({ message: errData.error ?? 'Error inesperado.' })
        setSearchState(SEARCH_STATE.ERROR)
      }
    } catch {
      setErrorData({
        message: 'No se pudo conectar al servidor. Inténtalo de nuevo.',
      })
      setSearchState(SEARCH_STATE.ERROR)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">
          Buscar en mis videos
        </h1>
        <p className="font-body text-sm text-on-surface-variant">
          Haz una pregunta y la IA buscará la respuesta en todos tus videos
          indexados.
        </p>
      </div>

      <section
        aria-labelledby="search-form-heading"
        className="flex flex-col gap-6 rounded-2xl border border-outline-variant bg-background p-6 shadow-sm"
      >
        <h2 id="search-form-heading" className="sr-only">
          Formulario de búsqueda
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          <SearchInput
            value={query}
            onChange={setQuery}
            disabled={searchState === SEARCH_STATE.LOADING}
          />

          {searchState === SEARCH_STATE.ERROR && errorData && (
            <ErrorBanner message={errorData.message} />
          )}

          <SearchButton
            disabled={!query.trim() || searchState === SEARCH_STATE.LOADING}
          />
        </form>
      </section>

      {searchState === SEARCH_STATE.LOADING && <LoadingSpinner />}

      {searchState === SEARCH_STATE.SUCCESS && successData && (
        <AnswerCard data={successData} />
      )}
    </div>
  )
}
