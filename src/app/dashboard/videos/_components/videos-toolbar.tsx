'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  DEFAULT_SORT,
  isVideoSort,
  VIDEO_SORT_OPTIONS,
  type VideoSort,
} from './video-sort'

interface VideosToolbarProps {
  onQueryChange: (query: string) => void
  /** Total videos before filtering */
  totalCount: number
  /** Videos after applying the current search query */
  filteredCount: number
}

export function VideosToolbar({
  onQueryChange,
  totalCount,
  filteredCount,
}: VideosToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawSort = searchParams.get('sort')
  const activeSort: VideoSort = isVideoSort(rawSort) ? rawSort : DEFAULT_SORT

  // Initialise from URL ?q= so the query survives navigation
  const rawQ = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(rawQ)
  const [isFocused, setIsFocused] = useState(false)
  const [isMac, setIsMac] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Detect platform once on mount (client-only)
  useEffect(() => {
    setIsMac(navigator.userAgent.includes('Mac'))
  }, [])

  // Sync parent state with initial URL value once on mount.
  // We intentionally only run this on mount — rawQ and onQueryChange are
  // stable references for the lifetime of the toolbar.
  const onQueryChangeRef = useRef(onQueryChange)
  useEffect(() => {
    if (rawQ) onQueryChangeRef.current(rawQ)
  }, [rawQ])

  // Ctrl/Cmd+F → focus the search input
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Debounce cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function handleQueryChange(value: string) {
    setQuery(value)
    // Persist in URL immediately (no debounce) so it survives navigation
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onQueryChange(value)
    }, 250)
  }

  function handleSortChange(sort: VideoSort) {
    const params = new URLSearchParams(searchParams.toString())
    if (sort === DEFAULT_SORT) {
      params.delete('sort')
    } else {
      params.set('sort', sort)
    }
    const qs = params.toString()
    router.push(qs ? `?${qs}` : '?', { scroll: false })
  }

  const showShortcutBadge = !isFocused && query === ''
  const hasActiveSearch = query.trim().length > 0
  const showCount = hasActiveSearch && filteredCount !== totalCount

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: search + count */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            ref={inputRef}
            type="search"
            aria-label="Buscar videos por título"
            placeholder="Buscar por título..."
            value={query}
            maxLength={100}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'w-full rounded-xl border border-outline-variant bg-surface-container',
              'py-2.5 pl-9',
              showShortcutBadge ? 'pr-16' : 'pr-4',
              'font-body text-sm text-on-surface placeholder:text-on-surface-variant/50',
              'transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
            )}
          />
          {showShortcutBadge && (
            <kbd
              className={cn(
                'pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2',
                'inline-flex items-center gap-0.5 rounded-md border border-outline-variant',
                'bg-surface px-1.5 py-0.5',
                'font-mono text-[10px] leading-none text-on-surface-variant/60',
              )}
            >
              {isMac ? '⌘' : 'Ctrl'}&thinsp;F
            </kbd>
          )}
        </div>

        {/* Result count */}
        {showCount && (
          <p
            aria-live="polite"
            className="font-body text-sm text-on-surface-variant"
          >
            <span className="font-bold text-on-surface">{filteredCount}</span>
            {' de '}
            <span className="font-bold text-on-surface">{totalCount}</span>
            {' video'}
            {totalCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Row 2: sort pill-tabs */}
      <div
        role="group"
        aria-label="Ordenar videos"
        className="flex flex-wrap items-center gap-1.5"
      >
        <span className="mr-1 font-body text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          Orden
        </span>
        {VIDEO_SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={activeSort === opt.value}
            onClick={() => handleSortChange(opt.value)}
            className={cn(
              'rounded-lg border px-3 py-1.5',
              'font-body text-xs font-semibold',
              'transition-colors',
              activeSort === opt.value
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant bg-surface-container text-on-surface-variant hover:border-primary/60 hover:text-on-surface',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────

interface IconProps {
  className?: string
}

function SearchIcon({ className }: IconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20l-3-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
