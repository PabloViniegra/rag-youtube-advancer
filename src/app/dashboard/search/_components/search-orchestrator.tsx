'use client'

/**
 * SearchOrchestrator
 *
 * Client component that owns the search state machine:
 *   idle → loading → success | error
 *
 * Accepts `children` (rendered into the idle slot) so the Server Component
 * parent can inject <QuickPrompts> without crossing the client boundary with
 * non-serialisable props.  The SearchQueryContext provided here lets those
 * server-rendered children call setQuery without prop-drilling functions.
 */

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  ViewTransition,
} from 'react'
import type {
  AugmentErrorResponse,
  AugmentSuccessResponse,
} from '@/lib/augmentation/types'
import { AUGMENT_API_ERROR, AUGMENT_DEFAULTS } from '@/lib/augmentation/types'
import type { AnswerData } from './answer-card'
import { AnswerCard } from './answer-card'
import type { SearchFormError } from './search-form'
import { SearchForm } from './search-form'
import { SearchLoading } from './search-loading'
import { SearchQueryContext } from './search-query-context'

// ── State machine ──────────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

interface SearchOrchestratorProps {
  /** Server-rendered quick-prompts slot (injected from page.tsx) */
  children?: React.ReactNode
}

export function SearchOrchestrator({ children }: SearchOrchestratorProps) {
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

    // Wrap in startTransition so ViewTransitions activate on the state change
    startTransition(() => {
      setSearchState(SEARCH_STATE.LOADING)
      setSuccessData(null)
      setErrorData(null)
    })

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
        startTransition(() => {
          setSuccessData({
            answer: data.answer,
            sources: data.sources,
            sourceCount: data.sourceCount,
          })
          setSearchState(SEARCH_STATE.SUCCESS)
        })
      } else {
        const errData = (await res.json()) as AugmentErrorResponse
        const isNoContext = errData.code === AUGMENT_API_ERROR.NO_CONTEXT
        const normalizedMessage = isNoContext
          ? FRIENDLY_NO_CONTEXT_MESSAGE
          : (errData.error ?? 'Error inesperado.')

        startTransition(() => {
          setErrorData({
            message:
              normalizedMessage === LEGACY_NO_CONTEXT_MESSAGE
                ? FRIENDLY_NO_CONTEXT_MESSAGE
                : normalizedMessage,
            code: errData.code,
          })
          setSearchState(SEARCH_STATE.ERROR)
        })
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      startTransition(() => {
        setErrorData({
          message: 'No se pudo conectar al servidor. Inténtalo de nuevo.',
        })
        setSearchState(SEARCH_STATE.ERROR)
      })
    }
  }

  function handleSuggestionClick(suggestion: string) {
    setQuery(suggestion)
    setErrorData(null)
    setSearchState(SEARCH_STATE.IDLE)
  }

  const isLoading = searchState === SEARCH_STATE.LOADING
  const showIdle = !successData && !isLoading && !query.trim()
  const formError = searchState === SEARCH_STATE.ERROR ? errorData : null

  const normalizedError: SearchFormError | null =
    formError?.code === AUGMENT_API_ERROR.FORBIDDEN
      ? {
          ...formError,
          message: 'Necesitas una suscripción activa para usar esta función.',
        }
      : formError

  return (
    <SearchQueryContext value={{ setQuery: handleSuggestionClick }}>
      {/* ── Search form ── */}
      <SearchForm
        query={query}
        onQueryChange={setQuery}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        showExamples={false}
        error={normalizedError}
        onSuggestionClick={handleSuggestionClick}
      />

      {/* ── AI quick-prompts (server-rendered, shown in idle state) ── */}
      {showIdle && (
        <ViewTransition enter="fade-in" exit="fade-out" default="none">
          {children}
        </ViewTransition>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <ViewTransition enter="fade-in" exit="fade-out" default="none">
          <SearchLoading />
        </ViewTransition>
      )}

      {/* ── Answer ── */}
      {searchState === SEARCH_STATE.SUCCESS && successData && (
        <ViewTransition enter="slide-up" default="none">
          <AnswerCard data={successData} />
        </ViewTransition>
      )}
    </SearchQueryContext>
  )
}
