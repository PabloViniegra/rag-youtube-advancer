import Link from 'next/link'
import { IntelligenceReportView } from '@/app/dashboard/videos/_components/intelligence-report'
import type { IntelligenceReport } from '@/lib/intelligence/types'

// ── Types ───────────────────────────────────────────────────────────────────

export interface SuccessData {
  videoId: string
  sectionCount: number
  report: IntelligenceReport | null
}

interface SuccessCardProps {
  data: SuccessData
  onReset: () => void
}

// ── Main Component ──────────────────────────────────────────────────────────

export function SuccessCard({ data, onReset }: SuccessCardProps) {
  return (
    <section
      aria-labelledby="success-heading"
      className="flex flex-col gap-8 animate-fade-up"
    >
      {/* Header — checkmark + stat */}
      <SuccessHeader sectionCount={data.sectionCount} />

      {/* Intelligence Report or fallback note */}
      {data.report ? (
        <IntelligenceReportView report={data.report} />
      ) : (
        <ReportFallbackNote />
      )}

      {/* CTA buttons */}
      <SuccessCta onReset={onReset} />
    </section>
  )
}

// ── Header ──────────────────────────────────────────────────────────────────

function SuccessHeader({ sectionCount }: { sectionCount: number }) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-outline-variant bg-background p-6 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 animate-fade-in">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="text-primary"
        >
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            strokeDasharray="1"
            className="[stroke-dashoffset:1] [animation:stroke-draw_0.5s_var(--ease-out-expo)_0.15s_both]"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h2
          id="success-heading"
          className="font-headline text-xl font-bold text-on-surface"
        >
          ¡Video indexado!
        </h2>

        <div className="inline-flex items-baseline gap-1.5 self-center rounded-xl bg-primary-container px-4 py-2">
          <span
            data-tabular-nums
            className="font-headline text-3xl font-extrabold text-primary"
          >
            {sectionCount}
          </span>
          <span className="font-body text-sm text-on-primary-container">
            fragmentos en memoria
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Report fallback ─────────────────────────────────────────────────────────

function ReportFallbackNote() {
  return (
    <div className="rounded-xl border border-outline-variant/50 bg-surface-container-low px-5 py-4 text-center">
      <p className="font-body text-sm text-on-surface-variant">
        El informe de inteligencia no pudo generarse. Puedes consultarlo más
        tarde desde el detalle del video.
      </p>
    </div>
  )
}

// ── CTA buttons ─────────────────────────────────────────────────────────────

function SuccessCta({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard/search"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-body text-sm font-bold text-on-primary transition-all hover:bg-primary-dim active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <SearchIcon />
          Buscar en mi cerebro
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="flex-1 inline-flex items-center justify-center rounded-xl border border-outline-variant px-4 py-3 font-body text-sm font-semibold text-on-surface transition-all hover:bg-surface-container active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Añadir otro video
        </button>
      </div>

      <Link
        href="/dashboard/videos"
        className="inline-flex min-h-[44px] items-center px-2 font-body text-xs text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:rounded focus-visible:ring-1 focus-visible:ring-primary/40"
      >
        Ver todos mis videos →
      </Link>
    </div>
  )
}

// ── Icons ───────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
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
