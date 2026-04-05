import type { IntelligenceTimestamp } from '@/lib/intelligence/types'
import type { SeoReport } from '@/lib/seo/types'
import { ChapterMarkersCard } from './chapter-markers-card'
import { SeoPackageCard } from './seo-package-card'
import { ShowNotesCard } from './show-notes-card'
import { ThumbnailBriefCard } from './thumbnail-brief-card'

interface SeoReportViewProps {
  report: SeoReport
  irTimestamps: IntelligenceTimestamp[]
}

export function SeoReportView({ report, irTimestamps }: SeoReportViewProps) {
  return (
    <section aria-label="SEO Pack" className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-headline text-2xl font-extrabold text-on-surface">
          SEO Pack
        </h2>
        <time
          dateTime={report.generatedAt}
          className="font-body text-xs text-on-surface-variant"
        >
          {formatDate(report.generatedAt)}
        </time>
      </div>

      {/* ── Cards ── */}
      <div className="flex flex-col gap-6">
        <SeoPackageCard seoPackage={report.seoPackage} />

        {irTimestamps.length > 0 && (
          <ChapterMarkersCard timestamps={irTimestamps} />
        )}

        <ShowNotesCard showNotes={report.showNotes} />
        <ThumbnailBriefCard thumbnailBrief={report.thumbnailBrief} />
      </div>
    </section>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}
