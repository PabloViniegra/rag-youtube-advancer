'use client'

import { startTransition, useState, ViewTransition } from 'react'
import type {
  IntelligenceReport,
  IntelligenceTimestamp,
} from '@/lib/intelligence/types'
import type { SeoReport } from '@/lib/seo/types'
import { cn } from '@/lib/utils'
import { IntelligenceReport as IntelligenceReportView } from '../../_components/intelligence-report/intelligence-report'
import { SeoReportView } from './seo-report'

// ── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = 'intelligence' | 'seo'

interface Tab {
  id: ActiveTab
  label: string
}

const TABS: Tab[] = [
  { id: 'intelligence', label: 'Informe de Inteligencia' },
  { id: 'seo', label: 'SEO Pack' },
]

// ── Props ────────────────────────────────────────────────────────────────────

interface VideoReportTabsProps {
  reportData: IntelligenceReport | null
  seoReportData: SeoReport | null
  irTimestamps: IntelligenceTimestamp[]
}

// ── Component ────────────────────────────────────────────────────────────────

export function VideoReportTabs({
  reportData,
  seoReportData,
  irTimestamps,
}: VideoReportTabsProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('intelligence')

  // Both null — render nothing
  if (reportData === null && seoReportData === null) return null

  // Only one non-null — skip tab bar, render as plain section
  if (reportData === null && seoReportData !== null) {
    return <SeoReportView report={seoReportData} irTimestamps={irTimestamps} />
  }

  if (reportData !== null && seoReportData === null) {
    return <IntelligenceReportView report={reportData} />
  }

  // Both available — render full tab UI.
  // The three guards above cover all cases where either value is null, so
  // TypeScript can narrow both to non-null inside this single combined check.
  if (reportData !== null && seoReportData !== null) {
    return (
      <BothReportsTabs
        reportData={reportData}
        seoReportData={seoReportData}
        irTimestamps={irTimestamps}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    )
  }

  return null
}

// ── Sub-component: both reports present ─────────────────────────────────────

interface BothReportsTabsProps {
  reportData: IntelligenceReport
  seoReportData: SeoReport
  irTimestamps: IntelligenceTimestamp[]
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
}

function BothReportsTabs({
  reportData,
  seoReportData,
  irTimestamps,
  activeTab,
  setActiveTab,
}: BothReportsTabsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* ── Tab Bar ── */}
      <div
        role="tablist"
        aria-label="Informes disponibles"
        className="flex gap-1 rounded-xl border border-outline-variant bg-surface-container p-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`report-tab-${tab.id}`}
            type="button"
            aria-selected={activeTab === tab.id}
            aria-controls={`report-panel-${tab.id}`}
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

      {/* ── Tab Panel ── */}
      <div
        role="tabpanel"
        id={`report-panel-${activeTab}`}
        aria-labelledby={`report-tab-${activeTab}`}
      >
        <ViewTransition key={activeTab}>
          {activeTab === 'intelligence' && (
            <IntelligenceReportView report={reportData} />
          )}
          {activeTab === 'seo' && (
            <SeoReportView report={seoReportData} irTimestamps={irTimestamps} />
          )}
        </ViewTransition>
      </div>
    </div>
  )
}
