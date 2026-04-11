'use client'

import type { CardConfig, ReportKind } from './reports-empty-state-config'

interface ReportCardProps {
  config: CardConfig
  isReady: boolean
  isPending: boolean
  onGenerate: (kind: ReportKind) => void
}

export function ReportCard({
  config,
  isReady,
  isPending,
  onGenerate,
}: ReportCardProps) {
  return (
    <article className="rounded-xl border border-outline-variant bg-background p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-headline text-sm font-bold text-on-surface">
          {config.title}
        </h3>
        <span
          className={
            isReady
              ? 'rounded-full bg-primary-container px-2.5 py-0.5 font-body text-[11px] font-semibold text-on-primary-container'
              : 'rounded-full bg-error-container px-2.5 py-0.5 font-body text-[11px] font-semibold text-on-error-container'
          }
        >
          {isReady ? config.readyLabel : config.missingLabel}
        </span>
      </div>

      <p className="mb-4 font-body text-sm text-on-surface-variant">
        {config.description}
      </p>

      {isReady ? null : (
        <button
          type="button"
          onClick={() => onGenerate(config.kind)}
          disabled={isPending}
          className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-3.5 font-body text-sm font-semibold text-on-primary transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Generando…' : config.actionLabel}
        </button>
      )}
    </article>
  )
}
