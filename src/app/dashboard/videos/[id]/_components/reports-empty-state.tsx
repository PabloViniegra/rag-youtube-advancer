'use client'

import { useRouter } from 'next/navigation'
import { startTransition, useState, useTransition } from 'react'
import { sileo } from 'sileo'
import {
  regenerateIntelligenceReport,
  type RegenerateReportResult,
  regenerateSeoReport,
} from '../../actions'
import {
  GENERATION_TARGET,
  type GenerationTarget,
  type ReportKind,
  REPORT_CARDS,
} from './reports-empty-state-config'
import { ReportCard } from './reports-empty-state-card'

interface ReportsEmptyStateProps {
  videoId: string
  hasIntelligence: boolean
  hasSeo: boolean
}

export function ReportsEmptyState({
  videoId,
  hasIntelligence,
  hasSeo,
}: ReportsEmptyStateProps) {
  const router = useRouter()
  const [isPending, runTransition] = useTransition()
  const [activeTarget, setActiveTarget] = useState<GenerationTarget | null>(
    null,
  )

  const missingKinds: ReportKind[] = [
    !hasIntelligence ? GENERATION_TARGET.INTELLIGENCE : null,
    !hasSeo ? GENERATION_TARGET.SEO : null,
  ].filter((kind): kind is ReportKind => kind !== null)

  const hasMissing = missingKinds.length > 0

  async function regenerateOne(
    kind: ReportKind,
  ): Promise<RegenerateReportResult> {
    return kind === GENERATION_TARGET.INTELLIGENCE
      ? regenerateIntelligenceReport(videoId)
      : regenerateSeoReport(videoId)
  }

  async function handleGenerate(kind: ReportKind) {
    startTransition(() => setActiveTarget(kind))

    runTransition(async () => {
      const result = await regenerateOne(kind)

      if (result.ok) {
        sileo.success({
          title: 'Reporte regenerado',
          description:
            kind === GENERATION_TARGET.INTELLIGENCE
              ? 'El Informe de Inteligencia ya está disponible.'
              : 'El SEO Pack ya está disponible.',
        })
        router.refresh()
      } else {
        sileo.error({
          title: 'No se pudo regenerar',
          description: result.error ?? 'Inténtalo de nuevo en unos segundos.',
        })
      }

      startTransition(() => setActiveTarget(null))
    })
  }

  async function handleGenerateAll() {
    if (missingKinds.length === 0) return

    startTransition(() => setActiveTarget(GENERATION_TARGET.ALL))

    runTransition(async () => {
      const entries = await Promise.all(
        missingKinds.map(async (kind) => ({
          kind,
          result: await regenerateOne(kind),
        })),
      )

      const failures = entries.filter((entry) => !entry.result.ok)
      const successes = entries.filter((entry) => entry.result.ok)

      if (failures.length === 0) {
        sileo.success({
          title: 'Reportes regenerados',
          description: 'Todo el contenido faltante ya está disponible.',
        })
      } else {
        const failedLabels = failures
          .map((entry) =>
            entry.kind === GENERATION_TARGET.INTELLIGENCE
              ? 'Informe de Inteligencia'
              : 'SEO Pack',
          )
          .join(', ')

        sileo.error({
          title: 'Regeneración parcial',
          description: `No se pudo regenerar: ${failedLabels}.`,
        })
      }

      if (successes.length > 0) router.refresh()

      startTransition(() => setActiveTarget(null))
    })
  }

  return (
    <section
      id="reports-recovery"
      aria-labelledby="reports-recovery-title"
      className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-6"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <h2
            id="reports-recovery-title"
            className="font-headline text-xl font-extrabold text-on-surface"
          >
            Reportes de este video
          </h2>
          <p className="font-body text-sm text-on-surface-variant">
            El video está indexado, pero puedes regenerar cualquier reporte que
            falte.
          </p>
        </div>

        {hasMissing && missingKinds.length > 1 ? (
          <button
            type="button"
            onClick={handleGenerateAll}
            disabled={isPending}
            className="inline-flex min-h-[44px] items-center rounded-lg border border-outline-variant bg-background px-3.5 font-body text-sm font-semibold text-on-surface transition-all hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && activeTarget === GENERATION_TARGET.ALL
              ? 'Regenerando todo…'
              : 'Regenerar todo'}
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ReportCard
          config={REPORT_CARDS.intelligence}
          isReady={hasIntelligence}
          isPending={
            isPending &&
            (activeTarget === GENERATION_TARGET.INTELLIGENCE ||
              activeTarget === GENERATION_TARGET.ALL)
          }
          onGenerate={handleGenerate}
        />
        <ReportCard
          config={REPORT_CARDS.seo}
          isReady={hasSeo}
          isPending={
            isPending &&
            (activeTarget === GENERATION_TARGET.SEO ||
              activeTarget === GENERATION_TARGET.ALL)
          }
          onGenerate={handleGenerate}
        />
      </div>
    </section>
  )
}
