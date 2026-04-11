'use client'

/**
 * SuccessCard
 *
 * Shown after a successful video ingestion. Displays:
 *  - animated checkmark + section count
 *  - BrainNodesViz (SVG brain visualization)
 *  - BrainCapacityMeter (fill bar)
 *  - ConfettiParticles (first-video celebration)
 *  - IntelligenceReport (or fallback note)
 *  - CTA buttons
 */

import { useRouter } from 'next/navigation'
import { IntelligenceReportView } from '@/app/dashboard/videos/_components/intelligence-report'
import type { IntelligenceReport } from '@/lib/intelligence/types'
import { BrainCapacityMeter } from './brain-capacity-meter'
import { BrainNodesViz } from './brain-nodes-viz'
import { ConfettiParticles } from './confetti-particles'

// ── Types ───────────────────────────────────────────────────────────────────

export interface SuccessData {
  videoId: string
  sectionCount: number
  report: IntelligenceReport | null
}

interface SuccessCardProps {
  data: SuccessData
  onReset: () => void
  totalVideoCount: number
  isFirstVideo: boolean
}

// ── Main Component ──────────────────────────────────────────────────────────

export function SuccessCard({
  data,
  onReset,
  totalVideoCount,
  isFirstVideo,
}: SuccessCardProps) {
  return (
    <section
      aria-labelledby="success-heading"
      className="relative flex flex-col gap-8 animate-fade-up"
    >
      <ConfettiParticles show={isFirstVideo} />

      {/* Header — checkmark + stat + brain viz + capacity meter */}
      <SuccessHeader
        sectionCount={data.sectionCount}
        newSectionCount={data.sectionCount}
        totalVideoCount={totalVideoCount}
      />

      {/* Intelligence Report or fallback note */}
      {data.report ? (
        <IntelligenceReportView report={data.report} />
      ) : (
        <ReportFallbackNote />
      )}

      {/* CTA buttons */}
      <SuccessCta videoId={data.videoId} onReset={onReset} />
    </section>
  )
}

// ── Header ──────────────────────────────────────────────────────────────────

interface SuccessHeaderProps {
  sectionCount: number
  newSectionCount: number
  totalVideoCount: number
}

function SuccessHeader({
  sectionCount,
  newSectionCount,
  totalVideoCount,
}: SuccessHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-background p-6 text-center shadow-sm">
      {/* Animated checkmark */}
      <div className="flex h-14 w-14 items-center justify-center self-center rounded-full bg-primary/10 animate-fade-in">
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
            className="[stroke-dashoffset:1] [animation:stroke-draw_0.5s_var(--ease-out-expo)_0.15s_both] motion-reduce:animation-none"
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

      {/* Brain visualization */}
      <div className="flex justify-center">
        <BrainNodesViz />
      </div>

      {/* Capacity meter */}
      <BrainCapacityMeter
        newSectionCount={newSectionCount}
        totalVideoCount={totalVideoCount}
      />
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

interface SuccessCtaProps {
  videoId: string
  onReset: () => void
}

function SuccessCta({ videoId, onReset }: SuccessCtaProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => router.push(`/dashboard/videos/${videoId}`)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-body text-sm font-bold text-on-primary transition-all hover:bg-primary-dim active:scale-[0.98]"
        >
          Ver video
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex-1 inline-flex items-center justify-center rounded-xl border border-outline-variant px-4 py-3 font-body text-sm font-semibold text-on-surface transition-all hover:bg-surface-container active:scale-[0.98]"
        >
          Añadir otro video
        </button>
      </div>

      <a
        href="/dashboard/search"
        className="inline-flex min-h-[44px] items-center px-2 font-body text-xs text-on-surface-variant transition-colors hover:text-on-surface"
      >
        Buscar en mi cerebro →
      </a>
    </div>
  )
}
