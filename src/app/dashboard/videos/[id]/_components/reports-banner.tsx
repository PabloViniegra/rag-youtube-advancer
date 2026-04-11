'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useTransition } from 'react'
import { sileo } from 'sileo'
import {
  regenerateIntelligenceReport,
  regenerateSeoReport,
} from '../../actions'
import {
  GENERATION_TARGET,
  type ReportKind,
} from './reports-empty-state-config'

const BANNER_QUERY = {
  FROM_INGEST: 'fromIngest',
  MISSING: 'missing',
} as const

const MISSING_VALUE = {
  INTELLIGENCE: 'intelligence',
  SEO: 'seo',
  BOTH: 'both',
} as const

interface ReportsBannerProps {
  videoId: string
  hasIntelligence: boolean
  hasSeo: boolean
}

export function ReportsBanner({
  videoId,
  hasIntelligence,
  hasSeo,
}: ReportsBannerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, runTransition] = useTransition()

  const shouldShow = searchParams.get(BANNER_QUERY.FROM_INGEST) === '1'

  const missingKinds = useMemo<ReportKind[]>(
    () =>
      [
        !hasIntelligence ? GENERATION_TARGET.INTELLIGENCE : null,
        !hasSeo ? GENERATION_TARGET.SEO : null,
      ].filter((kind): kind is ReportKind => kind !== null),
    [hasIntelligence, hasSeo],
  )

  const missingParam = searchParams.get(BANNER_QUERY.MISSING)

  const missingLabel =
    missingParam === MISSING_VALUE.BOTH
      ? 'faltan Informe de Inteligencia y SEO Pack'
      : missingParam === MISSING_VALUE.INTELLIGENCE
        ? 'falta el Informe de Inteligencia'
        : missingParam === MISSING_VALUE.SEO
          ? 'falta el SEO Pack'
          : 'falta contenido generado'

  if (!shouldShow) return null

  function clearBannerParams() {
    const next = new URLSearchParams(searchParams.toString())
    next.delete(BANNER_QUERY.FROM_INGEST)
    next.delete(BANNER_QUERY.MISSING)
    const qs = next.toString()
    router.replace(qs === '' ? `/dashboard/videos/${videoId}` : `?${qs}`)
  }

  async function handleRegenerateAll() {
    if (missingKinds.length === 0) {
      clearBannerParams()
      return
    }

    runTransition(async () => {
      const entries = await Promise.all(
        missingKinds.map(async (kind) => ({
          kind,
          result:
            kind === GENERATION_TARGET.INTELLIGENCE
              ? await regenerateIntelligenceReport(videoId)
              : await regenerateSeoReport(videoId),
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
        sileo.error({
          title: 'Regeneración parcial',
          description: 'Algunos reportes no se pudieron regenerar.',
        })
      }

      if (successes.length > 0) router.refresh()
      clearBannerParams()
    })
  }

  return (
    <section
      aria-live="polite"
      className="rounded-2xl border border-secondary/30 bg-secondary-container px-4 py-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-body text-sm text-on-secondary-container">
          Video indexado correctamente, pero {missingLabel}.
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearBannerParams}
            className="inline-flex min-h-[44px] items-center rounded-lg border border-on-secondary-container/20 px-3.5 font-body text-sm font-semibold text-on-secondary-container transition-colors hover:bg-secondary-container/40"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleRegenerateAll}
            disabled={isPending}
            className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-3.5 font-body text-sm font-semibold text-on-primary transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Regenerando…' : 'Regenerar ahora'}
          </button>
        </div>
      </div>
    </section>
  )
}
