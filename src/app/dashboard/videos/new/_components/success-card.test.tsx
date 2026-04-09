// @vitest-environment jsdom
/**
 * Tests for SuccessCard — renders after a video is successfully ingested.
 *
 * The IntelligenceReportView is mocked (heavy sub-tree) so these tests
 * focus on the card's own heading, stat badge, fallback note, nav links,
 * and reset callback.
 */
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { IntelligenceReport } from '@/lib/intelligence/types'
import type { SuccessData } from './success-card'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

vi.mock('@/app/dashboard/videos/_components/intelligence-report', () => ({
  IntelligenceReportView: ({ report: _report }: { report: unknown }) => (
    <div data-testid="intelligence-report">Intelligence Report</div>
  ),
}))

// ─── Import (after mocks) ─────────────────────────────────────────────────────

import { SuccessCard } from './success-card'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_REPORT = {
  generatedAt: '2025-01-15T10:30:00.000Z',
  summary: {
    tldr: { context: 'c', mainArgument: 'm', conclusion: 'c' },
    timestamps: [],
    keyTakeaways: ['a', 'b', 'c', 'd', 'e'],
  },
  repurpose: {
    twitterThread: Array.from({ length: 7 }, (_, i) => ({
      position: i + 1,
      content: `t${i + 1}`,
    })),
    shortScript: { hook: 'h', body: 'b', cta: 'c', suggestedClip: 's' },
    linkedinPost: 'lp',
    newsletterDraft: { subject: 's', body: 'b' },
  },
  analysis: {
    sentiment: {
      tone: 'educativo' as const,
      confidence: 0.8,
      explanation: 'e',
    },
    entities: [],
    suggestedQuestions: ['q1', 'q2', 'q3'],
  },
}

const BASE_DATA: SuccessData = {
  videoId: 'vid-1',
  sectionCount: 15,
  report: MOCK_REPORT as unknown as IntelligenceReport,
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SuccessCard', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders the success heading', () => {
    render(<SuccessCard data={BASE_DATA} onReset={vi.fn()} />)

    expect(
      screen.getByRole('heading', { name: '¡Video indexado!' }),
    ).toBeInTheDocument()
  })

  it('renders section count and fragment label', () => {
    render(<SuccessCard data={BASE_DATA} onReset={vi.fn()} />)

    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText(/fragmentos en memoria/i)).toBeInTheDocument()
  })

  it('renders intelligence report when report is provided', () => {
    render(<SuccessCard data={BASE_DATA} onReset={vi.fn()} />)

    expect(screen.getByTestId('intelligence-report')).toBeInTheDocument()
  })

  it('renders fallback note when report is null', () => {
    const data: SuccessData = { ...BASE_DATA, report: null }
    render(<SuccessCard data={data} onReset={vi.fn()} />)

    expect(
      screen.getByText(/El informe de inteligencia no pudo generarse/i),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('intelligence-report')).not.toBeInTheDocument()
  })

  it('renders navigation links with correct hrefs', () => {
    render(<SuccessCard data={BASE_DATA} onReset={vi.fn()} />)

    const searchLink = screen.getByRole('link', {
      name: /buscar en mi cerebro/i,
    })
    expect(searchLink).toHaveAttribute('href', '/dashboard/search')

    const videosLink = screen.getByRole('link', {
      name: /ver todos mis videos/i,
    })
    expect(videosLink).toHaveAttribute('href', '/dashboard/videos')
  })

  it('calls onReset when "Añadir otro video" is clicked', async () => {
    const user = userEvent.setup()
    const handleReset = vi.fn()

    render(<SuccessCard data={BASE_DATA} onReset={handleReset} />)

    await user.click(screen.getByRole('button', { name: /añadir otro video/i }))

    expect(handleReset).toHaveBeenCalledOnce()
  })

  it('renders correct section count for different values', () => {
    const data: SuccessData = { ...BASE_DATA, sectionCount: 42 }
    render(<SuccessCard data={data} onReset={vi.fn()} />)

    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.queryByText('15')).not.toBeInTheDocument()
  })
})
