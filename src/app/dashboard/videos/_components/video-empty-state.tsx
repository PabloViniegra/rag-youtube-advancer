import Link from 'next/link'

export function VideoEmptyState() {
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-outline-variant bg-background px-6 py-20 text-center">
      {/* Illustration placeholder */}
      <div className="flex size-24 items-center justify-center rounded-2xl bg-primary-container">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-on-primary-container"
          aria-hidden="true"
          role="img"
        >
          <path
            d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42C1 8.14 1 11.72 1 11.72s0 3.58.46 5.3a2.78 2.78 0 0 0 1.95 1.95C5.12 19.44 12 19.44 12 19.44s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95C23 15.3 23 11.72 23 11.72s0-3.58-.46-5.3Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m9.75 15.02 5.75-3.3-5.75-3.3v6.6Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Plus badge */}
          <circle
            cx="19"
            cy="5"
            r="5"
            className="fill-background stroke-outline-variant"
            strokeWidth="1"
          />
          <path
            d="M19 3v4M17 5h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-primary"
          />
        </svg>
      </div>

      {/* Copy */}
      <div className="flex flex-col gap-2">
        <h2 className="font-headline text-xl font-bold text-on-surface">
          Aún no tienes videos indexados
        </h2>
        <p className="max-w-sm font-body text-sm leading-relaxed text-on-surface-variant">
          Pega la URL de cualquier video de YouTube y lo convertiremos en
          conocimiento consultable mediante IA.
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/dashboard/videos/new"
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 font-body text-sm font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-dim active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <PlusIcon />
        Añadir primer video
      </Link>
    </div>
  )
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
