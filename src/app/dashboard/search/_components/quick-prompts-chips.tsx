'use client'

/**
 * QuickPromptsChips
 *
 * Thin client component that renders AI-generated question chips.
 * Reads `setQuery` from SearchQueryContext — no function prop crosses
 * the server→client serialisation boundary.
 */

import { useSearchQuery } from './search-query-context'

interface QuickPromptsChipsProps {
  questions: readonly string[]
}

export function QuickPromptsChips({ questions }: QuickPromptsChipsProps) {
  const { setQuery } = useSearchQuery()

  return (
    <div className="flex flex-col gap-2">
      <p className="font-body text-xs text-on-surface-variant">
        Ideas para empezar:
      </p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setQuery(q)}
            className="inline-flex items-center rounded-full border border-outline-variant bg-surface-container-low px-3 py-1.5 font-body text-xs font-medium text-on-surface transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
