'use client'

/**
 * /dashboard/search
 *
 * Search / Q&A UI — Client orchestrator.
 * Calls POST /api/augment and renders the AI answer + sources.
 *
 * Improvements applied:
 *  /distill  — form lives on the page surface, no card wrapper.
 *  /bolder   — answer block has editorial crimson left border + text-xl.
 *  /onboard  — LibraryStatus shows video count; idle chips surface examples.
 *  /delight  — Ctrl+Enter shortcut; rotating loading messages; copy button.
 *  /harden   — sources show video title as primary identifier.
 */

import { useEffect, useRef, useState } from 'react'
import type {
  AugmentErrorResponse,
  AugmentSuccessResponse,
} from '@/lib/augmentation/types'
import { AUGMENT_API_ERROR, AUGMENT_DEFAULTS } from '@/lib/augmentation/types'
import type { AnswerData } from './_components/answer-card'
import { AnswerCard } from './_components/answer-card'
import { LibraryStatus } from './_components/library-status'
import type { SearchFormError } from './_components/search-form'
import { SearchForm } from './_components/search-form'
import { SearchLoading } from './_components/search-loading'

// ── State machine ─────────────────────────────────────────────────────────────

const SEARCH_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const

type SearchState = (typeof SEARCH_STATE)[keyof typeof SEARCH_STATE]

const LEGACY_NO_CONTEXT_MESSAGE =
  'No relevant video sections found for the given query.'
const FRIENDLY_NO_CONTEXT_MESSAGE =
  'No encontré contexto suficiente para esa pregunta. Prueba con otras palabras o menciona una idea concreta del video.'

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [searchState, setSearchState] = useState<SearchState>(SEARCH_STATE.IDLE)
  const [successData, setSuccessData] = useState<AnswerData | null>(null)
  const [errorData, setErrorData] = useState<SearchFormError | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!query.trim()) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

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
        signal: controller.signal,
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
        const isNoContext = errData.code === AUGMENT_API_ERROR.NO_CONTEXT
        const normalizedMessage = isNoContext
          ? FRIENDLY_NO_CONTEXT_MESSAGE
          : (errData.error ?? 'Error inesperado.')

        setErrorData({
          message:
            normalizedMessage === LEGACY_NO_CONTEXT_MESSAGE
              ? FRIENDLY_NO_CONTEXT_MESSAGE
              : normalizedMessage,
          code: errData.code,
        })
        setSearchState(SEARCH_STATE.ERROR)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setErrorData({
        message: 'No se pudo conectar al servidor. Inténtalo de nuevo.',
      })
      setSearchState(SEARCH_STATE.ERROR)
    }
  }

  function handleSuggestionClick(suggestion: string) {
    setQuery(suggestion)
    setErrorData(null)
    setSearchState(SEARCH_STATE.IDLE)
  }

  const isLoading = searchState === SEARCH_STATE.LOADING
  const showExamples = !successData && !isLoading && !query.trim()
  const formError = searchState === SEARCH_STATE.ERROR ? errorData : null

  // Normalize the FORBIDDEN error to a user-friendly message
  const normalizedError: SearchFormError | null =
    formError?.code === AUGMENT_API_ERROR.FORBIDDEN
      ? {
          ...formError,
          message: 'Necesitas una suscripción activa para usar esta función.',
        }
      : formError

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-1.5 border-b border-outline-variant pb-6">
        <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary">
          Segundo cerebro
        </span>
        <h1 className="font-headline text-3xl font-extrabold leading-tight text-on-surface md:text-4xl">
          Buscar en mis videos
        </h1>
        <p className="font-body text-sm text-on-surface-variant">
          Haz una pregunta en lenguaje natural — la IA busca en todos tus videos
          a la vez.
        </p>
      </div>

      {/* ── Library status — /onboard ── */}
      <LibraryStatus />

      {/* ── Search form — /distill (no card wrapper) ── */}
      <SearchForm
        query={query}
        onQueryChange={setQuery}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        showExamples={showExamples}
        error={normalizedError}
        onSuggestionClick={handleSuggestionClick}
      />

      {/* ── Loading — /delight ── */}
      {isLoading && <SearchLoading />}

      {/* ── Answer — /bolder ── */}
      {searchState === SEARCH_STATE.SUCCESS && successData && (
        <AnswerCard data={successData} />
      )}
    </div>
  )
}
