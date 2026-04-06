import Link from 'next/link'

import { cn } from '@/lib/utils'

interface QuickActionsProps {
  hasVideos: boolean
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path
        d="m21 21-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function QuickActions({ hasVideos }: QuickActionsProps) {
  return (
    <div
      className={cn('grid gap-3', hasVideos ? 'grid-cols-2' : 'grid-cols-1')}
    >
      {/* Primary CTA — always visible */}
      <Link
        href="/dashboard/videos/new"
        transitionTypes={['nav-forward']}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary font-body text-sm font-bold text-on-primary shadow-sm transition-colors hover:bg-primary-dim active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <PlusIcon />
        {hasVideos ? 'Indexar video' : 'Indexar mi primer video'}
      </Link>

      {/* Secondary CTA — only when cerebro has content */}
      {hasVideos && (
        <Link
          href="/dashboard/search"
          transitionTypes={['nav-forward']}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-background font-body text-sm font-semibold text-on-surface transition-colors hover:border-outline hover:bg-surface-container active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <SearchIcon />
          Buscar en memoria
        </Link>
      )}
    </div>
  )
}
