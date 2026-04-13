import Link from 'next/link'

/**
 * LibraryStatus — /onboard
 *
 * Shows video library context above the search form.
 * Pure Server Component — receives videoCount as prop from search/page.tsx.
 *
 *  - 0 videos → empty state with CTA to add first video
 *  - N videos → compact count + manage link
 */

interface LibraryStatusProps {
  videoCount: number
}

export function LibraryStatus({ videoCount }: LibraryStatusProps) {
  if (videoCount === 0) {
    return (
      <div className="flex flex-col gap-3 rounded-xl bg-surface-container-low px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="font-body text-sm font-semibold text-on-surface">
            Tu biblioteca está vacía
          </p>
          <p className="font-body text-xs text-on-surface-variant">
            Añade al menos un video para poder buscar en él.
          </p>
        </div>
        <Link
          href="/dashboard/videos/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-body text-sm font-bold text-on-primary transition-all hover:bg-primary-dim active:scale-[0.98]"
        >
          <PlusIcon />
          Añadir video
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <p className="font-body text-xs text-on-surface-variant">
        <span className="font-semibold text-on-surface" data-tabular-nums>
          {videoCount}
        </span>{' '}
        {videoCount === 1 ? 'video indexado' : 'videos indexados'}
      </p>
      <Link
        href="/dashboard/videos"
        className="font-body text-xs font-medium text-primary underline-offset-2 hover:underline"
      >
        Gestionar →
      </Link>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
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
