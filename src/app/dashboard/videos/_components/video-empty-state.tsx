import Link from 'next/link'
import { BrainEmptyIllustration } from '@/components/ui/brain-empty-illustration'
import { cn } from '@/lib/utils'
import { UpgradeEmptyStateCta } from './video-upgrade-empty-state-cta'

interface VideoEmptyStateProps {
  trialExhausted?: boolean
}

export function VideoEmptyState({ trialExhausted = false }: VideoEmptyStateProps) {
  if (trialExhausted) {
    return <UpgradeEmptyState />
  }

  return <DefaultEmptyState />
}

// ── Default (first-time) empty state ──────────────────────────────────────────

function DefaultEmptyState() {
  return (
    <div className="flex flex-col gap-10">
      {/* ── Editorial hero empty state ── */}
      <div className="relative overflow-hidden rounded-xl border border-dashed border-outline-variant bg-primary-container/20 px-8 py-14 md:px-16">
        {/* Large background illustration — structural decoration */}
        <BrainEmptyIllustration
          className="pointer-events-none absolute -right-4 -top-6 h-auto w-48 text-outline-variant/20 select-none"
          aria-hidden="true"
        />

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
            className="inline-flex w-fit h-11 items-center gap-2 rounded-xl bg-primary px-6 font-body text-sm font-bold text-on-primary shadow-sm transition-all hover:bg-primary-dim active:scale-[0.98]"
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

// ── Upgrade (trial exhausted) empty state ─────────────────────────────────────

function UpgradeEmptyState() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-outline-variant bg-primary-container/20 px-8 py-14 md:px-16">
      {/* Background lock decoration */}
      <LockIllustration
        className="pointer-events-none absolute -right-4 -top-6 h-auto w-48 text-outline-variant/20 select-none"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 md:max-w-lg">
        {/* Overline */}
        <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary">
          Límite alcanzado
        </span>

        {/* Headline */}
        <div className="flex flex-col gap-2">
          <h2 className="font-headline text-2xl font-extrabold leading-tight text-on-surface md:text-3xl">
            Tu prueba gratuita ha terminado.
            <br />
            <span className="text-primary">Pasa a Pro.</span>
          </h2>
          <p className="font-body text-sm leading-relaxed text-on-surface-variant">
            Has usado tu video de prueba. Con el plan Pro indexas hasta 25
            videos, búsqueda ilimitada y reportes de inteligencia AI.
          </p>
        </div>

        {/* CTA + feature list */}
        <UpgradeEmptyStateCta />
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function LockIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden="true">
      <rect x="50" y="90" width="100" height="80" rx="12" stroke="currentColor" strokeWidth="8" />
      <path d="M70 90V65a30 30 0 0 1 60 0v25" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <circle cx="100" cy="130" r="10" fill="currentColor" />
      <line x1="100" y1="140" x2="100" y2="155" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}
