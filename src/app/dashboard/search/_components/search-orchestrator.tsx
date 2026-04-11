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
  AugmentStreamChunk,
} from '@/lib/augmentation/types'
import { AUGMENT_API_ERROR, AUGMENT_DEFAULTS } from '@/lib/augmentation/types'
import type { VideoSectionMatch } from '@/lib/retrieval/types'
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
  STREAMING: 'streaming',
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
  const [streamingSources, setStreamingSources] = useState<VideoSectionMatch[]>(
    [],
  )
  const [streamingAnswer, setStreamingAnswer] = useState('')
  const [relatedQueries, setRelatedQueries] = useState<string[]>([])
  const [successData, setSuccessData] = useState<AnswerData | null>(null)
  const [errorData, setErrorData] = useState<SearchFormError | null>(null)

  // Mutable ref to accumulate tokens without triggering a re-render per token
  const answerRef = useRef('')
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (flushTimerRef.current !== null) clearInterval(flushTimerRef.current)
    }
  }, [])

  function startFlushTimer() {
    if (flushTimerRef.current !== null) return
    flushTimerRef.current = setInterval(() => {
      const current = answerRef.current
      startTransition(() => setStreamingAnswer(current))
    }, 50)
  }

  function stopFlushTimer() {
    if (flushTimerRef.current !== null) {
      clearInterval(flushTimerRef.current)
      flushTimerRef.current = null
    }
  }

  async function runSearch(q: string) {
    abortRef.current?.abort()
    stopFlushTimer()

    const controller = new AbortController()
    abortRef.current = controller
    answerRef.current = ''

    // Urgent update — direct setState so tests (and the UI) react immediately
    setSearchState(SEARCH_STATE.LOADING)
    setSuccessData(null)
    setStreamingSources([])
    setStreamingAnswer('')
    setRelatedQueries([])
    setErrorData(null)

    try {
      const res = await fetch('/api/augment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          query: q,
          matchThreshold: AUGMENT_DEFAULTS.matchThreshold,
          matchCount: AUGMENT_DEFAULTS.matchCount,
        }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const errData = (await res.json()) as AugmentErrorResponse
        const isNoContext = errData.code === AUGMENT_API_ERROR.NO_CONTEXT
        const msg = isNoContext
          ? FRIENDLY_NO_CONTEXT_MESSAGE
          : (errData.error ?? 'Error inesperado.')
        setErrorData({
          message:
            msg === LEGACY_NO_CONTEXT_MESSAGE
              ? FRIENDLY_NO_CONTEXT_MESSAGE
              : msg,
          code: errData.code,
        })
        setSearchState(SEARCH_STATE.ERROR)
        return
      }

      // ── SSE reader ─────────────────────────────────────────────────────────
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let lineBuffer = ''
      // Local variable to avoid stale-closure when accessing sources at `done`
      let capturedSources: VideoSectionMatch[] = []

      function processLine(line: string) {
        if (!line.startsWith('data: ')) return
        const json = line.slice(6)
        let chunk: AugmentStreamChunk
        try {
          chunk = JSON.parse(json) as AugmentStreamChunk
        } catch {
          return
        }

        if (chunk.type === 'sources') {
          capturedSources = chunk.payload
          startTransition(() => {
            setStreamingSources(capturedSources)
            setSearchState(SEARCH_STATE.STREAMING)
          })
          startFlushTimer()
        } else if (chunk.type === 'token') {
          answerRef.current += chunk.payload
        } else if (chunk.type === 'done') {
          stopFlushTimer()
          const finalAnswer = answerRef.current
          setStreamingAnswer(finalAnswer)
          setRelatedQueries(chunk.relatedQueries)
          setSuccessData({
            answer: finalAnswer,
            sources: capturedSources,
            sourceCount: capturedSources.length,
          })
          setSearchState(SEARCH_STATE.SUCCESS)
        }
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        lineBuffer += decoder.decode(value, { stream: true })
        const lines = lineBuffer.split('\n')
        // Keep the last (possibly incomplete) line in the buffer
        lineBuffer = lines.pop() ?? ''
        for (const line of lines) {
          if (line.trim()) processLine(line)
        }
      }
      // Process any remaining buffered content
      if (lineBuffer.trim()) processLine(lineBuffer)
    } catch (err) {
      stopFlushTimer()
      if (err instanceof Error && err.name === 'AbortError') return
      setErrorData({
        message: 'No se pudo conectar al servidor. Inténtalo de nuevo.',
      })
      setSearchState(SEARCH_STATE.ERROR)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!query.trim()) return
    void runSearch(query.trim())
  }

  function submitQuery(q: string) {
    setQuery(q)
    void runSearch(q)
  }

  function handleSuggestionClick(suggestion: string) {
    setQuery(suggestion)
    setErrorData(null)
    setSearchState(SEARCH_STATE.IDLE)
  }

  const isLoading = searchState === SEARCH_STATE.LOADING
  const isStreaming = searchState === SEARCH_STATE.STREAMING
  const showIdle = !successData && !isLoading && !isStreaming && !query.trim()
  const formError = searchState === SEARCH_STATE.ERROR ? errorData : null

  const normalizedError: SearchFormError | null =
    formError?.code === AUGMENT_API_ERROR.FORBIDDEN
      ? {
          ...formError,
          message: 'Necesitas una suscripción activa para usar esta función.',
        }
      : formError

  // Data shown while streaming — use accumulated state
  const streamingData: AnswerData | null = isStreaming
    ? {
        answer: streamingAnswer,
        sources: streamingSources,
        sourceCount: streamingSources.length,
      }
    : null

  return (
    <SearchQueryContext
      value={{ setQuery: handleSuggestionClick, submitQuery }}
    >
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

      {/* ── Streaming answer ── */}
      {isStreaming && streamingData && (
        <ViewTransition enter="slide-up" default="none">
          <AnswerCard data={streamingData} isStreaming />
        </ViewTransition>
      )}

      {/* ── Final answer ── */}
      {searchState === SEARCH_STATE.SUCCESS && successData && (
        <ViewTransition enter="slide-up" default="none">
          <AnswerCard
            data={successData}
            relatedQueries={relatedQueries}
            onRegenerate={() => void runSearch(query.trim())}
          />
        </ViewTransition>
      )}
    </SearchQueryContext>
  )
}
