'use client'

/**
 * SearchQueryContext
 *
 * Thin client-side context that lets Server-rendered children (e.g. QuickPrompts)
 * inject a question into the SearchOrchestrator's query state without crossing
 * the server→client prop boundary with a non-serializable function.
 */

import { createContext, use } from 'react'

interface SearchQueryContextValue {
  setQuery: (q: string) => void
}

export const SearchQueryContext = createContext<SearchQueryContextValue>({
  setQuery: () => {},
})

export function useSearchQuery(): SearchQueryContextValue {
  return use(SearchQueryContext)
}
