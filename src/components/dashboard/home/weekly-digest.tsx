import Link from 'next/link'
import { ArrowRightIcon } from '@/components/dashboard/icons'
import type { WeeklyDigestRow } from '@/lib/weekly-digest/types'
import { WeeklyDigestDismissButton } from './weekly-digest-dismiss-button'

interface WeeklyDigestProps {
  digest: WeeklyDigestRow | null
}

export function WeeklyDigest({ digest }: WeeklyDigestProps) {
  if (!digest) return null

  return (
    <aside
      aria-label="Resumen semanal"
      className="rounded-lg border border-tertiary-container bg-tertiary-container/30 px-5 py-4"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-on-tertiary-container">
          Insights · esta semana
        </p>
        <WeeklyDigestDismissButton digestId={digest.id} />
      </div>

      {digest.topics.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
            Temas
          </p>
          <div className="flex flex-wrap gap-2">
            {digest.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-tertiary-container px-3 py-1 text-xs font-medium text-on-tertiary-container"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {digest.connections.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
            Conexiones
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-on-surface-variant">
            {digest.connections.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {digest.suggested_questions.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
            Pregúntale al AI
          </p>
          <div className="flex flex-wrap gap-2">
            {digest.suggested_questions.map((q) => (
              <Link
                key={q}
                href={`/dashboard/search?q=${encodeURIComponent(q)}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary transition-all hover:bg-primary-dim active:scale-[0.98]"
              >
                {q}
                <ArrowRightIcon />
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
