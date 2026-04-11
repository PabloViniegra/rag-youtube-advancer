'use client'

/**
 * RelatedQueries
 *
 * Renders a row of suggestion chips. Clicking a chip sets the search query
 * via SearchQueryContext AND triggers a new search submission.
 */

import { useSearchQuery } from './search-query-context'

// ── Types ─────────────────────────────────────────────────────────────────────

interface RelatedQueriesProps {
  queries: string[]
  /** Optional override — if omitted the component uses SearchQueryContext */
  onSelect?: (q: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RelatedQueries({ queries, onSelect }: RelatedQueriesProps) {
  const { submitQuery } = useSearchQuery()

  function handleSelect(q: string) {
    if (onSelect) {
      onSelect(q)
      return
    }
    submitQuery(q)
  }

  if (queries.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">
        Preguntas relacionadas
      </h3>
      <ul className="flex flex-wrap gap-2">
        {queries.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => handleSelect(q)}
              className="inline-flex min-h-11 items-center rounded-full border border-outline-variant bg-surface-container px-4 py-2 font-body text-sm text-on-surface-variant transition-colors hover:border-primary hover:bg-surface-container-high hover:text-on-surface"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
