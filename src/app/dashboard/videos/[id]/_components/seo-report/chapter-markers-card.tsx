import { CopyButton } from '@/app/dashboard/videos/_components/intelligence-report/copy-button'
import type { IntelligenceTimestamp } from '@/lib/intelligence/types'
import { formatChapterMarkers } from '@/lib/seo/chapter-markers'

interface ChapterMarkersCardProps {
  timestamps: IntelligenceTimestamp[]
}

export function ChapterMarkersCard({ timestamps }: ChapterMarkersCardProps) {
  if (timestamps.length === 0) return null

  const formatted = formatChapterMarkers(timestamps)

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 flex flex-col gap-4">
      {/* ── Card Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-headline text-lg font-bold text-on-surface">
            Marcadores de Capítulos
          </h3>
          <p className="font-body text-xs text-on-surface-variant">
            Pega esto directamente en la descripción de YouTube
          </p>
        </div>
        <CopyButton
          text={formatted}
          aria-label="Copiar marcadores de capítulos"
        />
      </div>

      {/* ── Formatted Output ── */}
      <pre className="rounded-xl bg-surface-container p-4 font-mono text-sm text-on-surface whitespace-pre overflow-x-auto leading-relaxed">
        {formatted}
      </pre>
    </div>
  )
}
