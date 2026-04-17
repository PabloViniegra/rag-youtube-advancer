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
import { useCountUp } from '@/components/landing/use-count-up'
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
  const countValue = useCountUp(sectionCount, 900)

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-background shadow-sm">
      {/* ── Zone A: Celebration ─────────────────────────────────── */}
      <div className="flex flex-col items-center gap-5 px-6 pt-8 pb-7 text-center">
        {/* Checkmark — solid primary with pop + stroke-draw */}
        <div
          className="flex h-16 w-16 items-center justify-center self-center rounded-full bg-primary animate-pop"
          aria-hidden="true"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-on-primary"
          >
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              strokeDasharray="1"
              className="[stroke-dashoffset:1] [animation:stroke-draw_0.5s_var(--ease-out-expo)_0.35s_both] motion-reduce:animation-none"
            />
          </svg>
        </div>

        <h2
          id="success-heading"
          className="font-headline text-2xl font-bold text-on-surface"
        >
          ¡Video indexado!
        </h2>

        {/* Count-up badge */}
        <div className="inline-flex items-baseline gap-2 self-center rounded-xl bg-primary-container px-5 py-2.5">
          <span
            data-tabular-nums
            aria-label={`${sectionCount} fragmentos`}
            className="font-headline text-4xl font-extrabold text-primary"
          >
            {countValue}
          </span>
          <span className="font-body text-sm text-on-primary-container">
            fragmentos en memoria
          </span>
        </div>
      </div>

      {/* ── Separator ───────────────────────────────────────────── */}
      <div className="mx-4 h-px bg-outline-variant/40" aria-hidden="true" />

      {/* ── Zone B: Brain state ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 px-6 py-6">
        <div className="flex justify-center">
          <BrainNodesViz />
        </div>
        <BrainCapacityMeter
          newSectionCount={newSectionCount}
          totalVideoCount={totalVideoCount}
        />
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
