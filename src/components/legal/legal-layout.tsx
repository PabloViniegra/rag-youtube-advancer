import type { ReactNode } from 'react'
import { FileText, Calendar } from 'lucide-react'
import { LegalToc } from './legal-toc'

export interface TocSection {
  id: string
  title: string
}

interface LegalLayoutProps {
  title: string
  description?: string
  lastUpdated: string
  badgeText?: string
  sections: TocSection[]
  children: ReactNode
}

export function LegalLayout({
  title,
  description,
  lastUpdated,
  badgeText = 'Documento Legal',
  sections,
  children,
}: LegalLayoutProps) {
  return (
    <article>
      {/* Editorial Header — warm cream bg, crimson badge, large headline */}
      <header className="bg-surface-container-low border-b border-outline-variant">
        <div className="max-w-6xl mx-auto px-6 pt-32 pb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-label font-bold uppercase tracking-[0.1em] text-primary bg-primary-container px-3 py-1.5 rounded-full mb-6">
              <FileText size={11} strokeWidth={2.5} aria-hidden="true" />
              {badgeText}
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-black text-on-surface mb-4 leading-none tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-base text-on-surface-variant font-body leading-relaxed mb-6">
                {description}
              </p>
            )}
            <div className="inline-flex items-center gap-2 text-sm text-on-surface-variant font-body bg-surface-container px-3.5 py-1.5 rounded-full border border-outline-variant">
              <Calendar
                size={13}
                className="shrink-0 text-primary/60"
                aria-hidden="true"
              />
              <time>Última actualización: {lastUpdated}</time>
            </div>
          </div>
        </div>
      </header>

      {/* Two-column layout: sidebar TOC + main content */}
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 xl:gap-16 items-start">
          <aside className="hidden lg:block">
            <LegalToc sections={sections} />
          </aside>
          <main id="main-content" className="min-w-0 space-y-10">
            {children}
          </main>
        </div>
      </div>
    </article>
  )
}
