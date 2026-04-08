import Link from 'next/link'
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
      <div className="mb-3 flex items-center justify-between">
        <p className="font-label text-[10px] font-bold uppercase tracking-widest text-on-tertiary-container">
          Resumen de esta semana
        </p>
        <WeeklyDigestDismissButton digestId={digest.id} />
      </div>

      {digest.topics.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {digest.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-tertiary-container px-3 py-1 text-xs font-medium text-on-tertiary-container"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {digest.connections.length > 0 && (
        <ul className="mb-3 list-inside list-disc space-y-1 text-sm text-on-surface-variant">
          {digest.connections.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}

      {digest.suggested_questions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {digest.suggested_questions.map((q) => (
            <Link
              key={q}
              href={`/dashboard/search?q=${encodeURIComponent(q)}`}
              className="rounded-full border border-outline-variant px-3 py-1 text-xs text-on-surface-variant transition-colors hover:bg-surface-variant"
            >
              {q}
            </Link>
          ))}
        </div>
      )}
    </aside>
  )
}
