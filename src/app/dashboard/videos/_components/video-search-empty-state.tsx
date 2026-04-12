// ── VideoSearchEmptyState ─────────────────────────────────────────────────────
// Shown when the user's search query returns no matching videos.

interface VideoSearchEmptyStateProps {
  query: string
  /** Called when the user clicks the "Limpiar búsqueda" button */
  onClear: () => void
}

export function VideoSearchEmptyState({
  query,
  onClear,
}: VideoSearchEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-outline-variant bg-surface-container/40 px-8 py-16 text-center">
      <SearchOffIcon className="h-10 w-10 text-on-surface-variant/40" />
      <div className="flex flex-col gap-1.5">
        <p className="font-headline text-base font-bold text-on-surface">
          Sin resultados para &ldquo;{query}&rdquo;
        </p>
        <p className="font-body text-sm text-on-surface-variant">
          Prueba con otro término o revisa que el título del video lo incluya.
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container px-4 py-2 font-body text-sm font-semibold text-on-surface transition-colors hover:border-primary/60 hover:text-primary"
      >
        Limpiar búsqueda
      </button>
    </div>
  )
}

// ── Icon ──────────────────────────────────────────────────────────────────────

interface IconProps {
  className?: string
}

function SearchOffIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M20 20l-3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.5 8.5l5 5M13.5 8.5l-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
