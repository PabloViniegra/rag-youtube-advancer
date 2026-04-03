import type {
  IntelligenceSummary,
  IntelligenceTimestamp,
  IntelligenceTldr,
} from '@/lib/intelligence/types'

// ── Props ───────────────────────────────────────────────────────────────────

interface SummarySectionProps {
  summary: IntelligenceSummary
}

// ── Main Section ────────────────────────────────────────────────────────────

export function SummarySection({ summary }: SummarySectionProps) {
  return (
    <div className="flex flex-col gap-8">
      <TldrCard tldr={summary.tldr} />
      <TimestampsList timestamps={summary.timestamps} />
      <KeyTakeaways takeaways={summary.keyTakeaways} />
    </div>
  )
}

// ── TL;DW Card ──────────────────────────────────────────────────────────────

const TLDR_SECTIONS = [
  { key: 'context', label: 'Contexto' },
  { key: 'mainArgument', label: 'Argumento Principal' },
  { key: 'conclusion', label: 'Conclusión' },
] as const

interface TldrCardProps {
  tldr: IntelligenceTldr
}

function TldrCard({ tldr }: TldrCardProps) {
  return (
    <section aria-labelledby="tldw-heading">
      <h3
        id="tldw-heading"
        className="mb-4 font-headline text-lg font-extrabold text-on-surface"
      >
        TL;DW — Resumen Rápido
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        {TLDR_SECTIONS.map(({ key, label }, idx) => (
          <div
            key={key}
            className="animate-fade-up stagger-item rounded-xl border border-outline-variant bg-surface-container-low p-5"
            style={{ '--i': idx } as React.CSSProperties}
          >
            <span className="mb-1.5 block font-body text-xs font-bold uppercase tracking-wider text-primary">
              {label}
            </span>
            <p className="font-body text-sm leading-relaxed text-on-surface">
              {tldr[key]}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Timestamps ──────────────────────────────────────────────────────────────

interface TimestampsListProps {
  timestamps: IntelligenceTimestamp[]
}

function TimestampsList({ timestamps }: TimestampsListProps) {
  if (timestamps.length === 0) return null

  return (
    <section aria-labelledby="timestamps-heading">
      <h3
        id="timestamps-heading"
        className="mb-4 font-headline text-lg font-extrabold text-on-surface"
      >
        Marcas de Tiempo
      </h3>

      <ol className="flex flex-col gap-2">
        {timestamps.map((ts, idx) => (
          <li
            key={`${ts.time}-${idx}`}
            className="animate-fade-up stagger-item flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-container"
            style={{ '--i': idx } as React.CSSProperties}
          >
            <span className="inline-flex min-w-[52px] items-center justify-center rounded-md bg-primary-container px-2 py-0.5 font-mono text-xs font-bold text-on-primary-container">
              {ts.time}
            </span>
            <span className="font-body text-sm text-on-surface">
              {ts.label}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

// ── Key Takeaways ───────────────────────────────────────────────────────────

interface KeyTakeawaysProps {
  takeaways: [string, string, string, string, string]
}

function KeyTakeaways({ takeaways }: KeyTakeawaysProps) {
  return (
    <section aria-labelledby="takeaways-heading">
      <h3
        id="takeaways-heading"
        className="mb-4 font-headline text-lg font-extrabold text-on-surface"
      >
        5 Ideas Clave
      </h3>

      <ol className="flex flex-col gap-3">
        {takeaways.map((takeaway, idx) => (
          <li
            key={takeaway.slice(0, 32)}
            className="animate-fade-up stagger-item flex items-start gap-3 rounded-lg border border-outline-variant/50 bg-surface-container-low px-4 py-3"
            style={{ '--i': idx } as React.CSSProperties}
          >
            <span
              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary-container font-body text-xs font-bold text-on-secondary-container"
              aria-hidden="true"
            >
              {idx + 1}
            </span>
            <p className="font-body text-sm leading-relaxed text-on-surface">
              {takeaway}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
