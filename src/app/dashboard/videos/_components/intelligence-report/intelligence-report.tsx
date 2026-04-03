'use client'

import { startTransition, useState, ViewTransition } from 'react'
import type { IntelligenceReport as IntelligenceReportData } from '@/lib/intelligence/types'
import { cn } from '@/lib/utils'
import { AnalysisSection } from './analysis-section'
import { RepurposeSection } from './repurpose-section'
import { SummarySection } from './summary-section'

// ── Tab Config ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'summary', label: 'Resumen' },
  { id: 'repurpose', label: 'Reutilizar Contenido' },
  { id: 'analysis', label: 'Análisis Profundo' },
] as const

type TabId = (typeof TABS)[number]['id']

// ── Props ───────────────────────────────────────────────────────────────────

interface IntelligenceReportProps {
  report: IntelligenceReportData
}

// ── Main Component ──────────────────────────────────────────────────────────

export function IntelligenceReport({ report }: IntelligenceReportProps) {
  const [activeTab, setActiveTab] = useState<TabId>('summary')

  return (
    <section
      aria-label="Informe de Inteligencia"
      className="flex flex-col gap-6"
    >
      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-headline text-2xl font-extrabold text-on-surface">
          Informe de Inteligencia
        </h2>
        <time
          dateTime={report.generatedAt}
          className="font-body text-xs text-on-surface-variant"
        >
          {formatDate(report.generatedAt)}
        </time>
      </div>

      {/* ── Tab Bar ── */}
      <nav aria-label="Secciones del informe">
        <div
          role="tablist"
          aria-label="Secciones del informe"
          className="flex gap-1 rounded-xl border border-outline-variant bg-surface-container p-1"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              type="button"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => startTransition(() => setActiveTab(tab.id))}
              className={cn(
                'flex-1 rounded-lg px-4 py-2.5 font-headline text-sm font-bold transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                activeTab === tab.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Tab Panels ── */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        <ViewTransition key={activeTab}>
          {activeTab === 'summary' && (
            <SummarySection summary={report.summary} />
          )}
          {activeTab === 'repurpose' && (
            <RepurposeSection repurpose={report.repurpose} />
          )}
          {activeTab === 'analysis' && (
            <AnalysisSection analysis={report.analysis} />
          )}
        </ViewTransition>
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
