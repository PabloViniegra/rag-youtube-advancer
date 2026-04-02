const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5'] as const

export default function VideoDetailLoading() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true">
      <span className="sr-only" aria-live="polite">
        Cargando detalles del video…
      </span>

      {/* Header skeleton */}
      <div className="rounded-2xl border border-outline-variant bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          {/* Thumbnail skeleton */}
          <div className="aspect-video w-full shrink-0 animate-pulse rounded-2xl bg-surface-container sm:w-64" />

          {/* Meta skeleton */}
          <div className="flex flex-1 flex-col gap-4">
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-surface-container" />
            <div className="flex flex-wrap gap-4">
              <div className="h-12 w-24 animate-pulse rounded-lg bg-surface-container" />
              <div className="h-12 w-32 animate-pulse rounded-lg bg-surface-container" />
              <div className="h-12 w-28 animate-pulse rounded-lg bg-surface-container" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="h-10 w-44 animate-pulse rounded-xl bg-surface-container" />
              <div className="h-10 w-36 animate-pulse rounded-xl bg-surface-container" />
            </div>
          </div>
        </div>
      </div>

      {/* Sections skeleton */}
      <div className="flex flex-col gap-4">
        <div className="h-4 w-40 animate-pulse rounded bg-surface-container" />
        <ul className="flex flex-col gap-3">
          {SKELETON_KEYS.map((key) => (
            <li
              key={key}
              className="h-16 w-full animate-pulse rounded-xl bg-surface-container-low"
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
