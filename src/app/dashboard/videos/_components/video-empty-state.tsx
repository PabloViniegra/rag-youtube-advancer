import Link from 'next/link'
import { cn } from '@/lib/utils'

export function VideoEmptyState() {
  return (
    <div className="flex flex-col gap-10">
      {/* ── Editorial hero empty state ── */}
      <div className="relative overflow-hidden rounded-xl border border-dashed border-outline-variant bg-primary-container/20 px-8 py-14 md:px-16">
        {/* Large background numeral — structural decoration */}
        <span
          className="pointer-events-none absolute -right-4 -top-6 font-headline text-[11rem] font-extrabold leading-none text-outline-variant/20 select-none"
          aria-hidden="true"
        >
          0
        </span>

        <div className="relative flex flex-col gap-6 md:max-w-lg">
          {/* Overline */}
          <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary">
            Empieza aquí
          </span>

          {/* Headline */}
          <div className="flex flex-col gap-2">
            <h2 className="font-headline text-2xl font-extrabold leading-tight text-on-surface md:text-3xl">
              Tu cerebro está vacío.
              <br />
              <span className="text-primary">Llenémoslo.</span>
            </h2>
            <p className="font-body text-sm leading-relaxed text-on-surface-variant">
              Pega la URL de cualquier video de YouTube con subtítulos y lo
              convertiremos en conocimiento consultable mediante IA. Pregunta en
              lenguaje natural, genera ganchos para redes, extrae ideas clave.
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/dashboard/videos/new"
            className="inline-flex w-fit h-11 items-center gap-2 rounded-xl bg-primary px-6 font-body text-sm font-bold text-on-primary shadow-sm transition-all hover:bg-primary-dim active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <PlusIcon />
            Indexar primer video
          </Link>
        </div>
      </div>

      {/* ── 3-step process strip ── */}
      <div className="grid grid-cols-1 divide-y divide-outline-variant rounded-xl border border-outline-variant overflow-hidden sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <ProcessStep
          number="01"
          title="Pega una URL"
          description="Cualquier video de YouTube con subtítulos en español o inglés."
        />
        <ProcessStep
          number="02"
          title="Indexamos el transcript"
          description="Extraemos el texto, lo fragmentamos y lo convertimos en vectores semánticos."
        />
        <ProcessStep
          number="03"
          title="Pregunta libremente"
          description="Busca ideas, momentos clave o genera ganchos para redes sociales."
          accent
        />
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface ProcessStepProps {
  number: string
  title: string
  description: string
  accent?: boolean
}

function ProcessStep({ number, title, description, accent }: ProcessStepProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 px-6 py-5',
        accent
          ? 'border-l-2 border-primary bg-primary-container'
          : 'bg-background',
      )}
    >
      <span
        className={cn(
          'select-none font-headline text-3xl font-extrabold leading-none',
          accent ? 'text-primary' : 'text-outline-variant',
        )}
        aria-hidden="true"
      >
        {number}
      </span>
      <h3
        className={cn(
          'font-headline text-sm font-bold',
          accent ? 'text-on-primary-container' : 'text-on-surface',
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          'font-body text-xs leading-relaxed',
          accent ? 'text-on-primary-container/80' : 'text-on-surface-variant',
        )}
      >
        {description}
      </p>
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────

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
