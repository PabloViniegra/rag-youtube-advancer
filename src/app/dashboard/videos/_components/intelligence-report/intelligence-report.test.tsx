// @vitest-environment jsdom
/**
 * Tests for IntelligenceReport — Client Component (tabbed wrapper)
 *
 * Verifies header rendering, tab bar navigation, aria attributes,
 * and that each section renders the correct content when its tab is active.
 */
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { IntelligenceReport as IntelligenceReportData } from '@/lib/intelligence/types'

// ─── Mocks ────────────────────────────────────────────────────────────────────

// ViewTransition is a React canary API — shim it so components render in jsdom
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    ViewTransition: ({ children }: { children?: React.ReactNode }) => children,
  }
})

// Clipboard API used by CopyButton
Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
})

// ─── Import (after mocks) ─────────────────────────────────────────────────────

import { IntelligenceReport } from './intelligence-report'

// ─── Fixture ──────────────────────────────────────────────────────────────────

const MOCK_REPORT: IntelligenceReportData = {
  generatedAt: '2025-01-15T10:30:00.000Z',
  summary: {
    tldr: {
      context: 'Un video sobre programación con IA.',
      mainArgument: 'La IA va a cambiar la forma en que trabajamos.',
      conclusion: 'Es importante adaptarse a los nuevos cambios.',
    },
    timestamps: [
      { time: '00:00', label: 'Introducción' },
      { time: '02:15', label: 'El impacto de la IA' },
      { time: '05:30', label: 'Conclusión' },
    ],
    keyTakeaways: [
      'La IA está transformando la industria.',
      'Los desarrolladores deben adaptarse.',
      'La automatización no reemplaza la creatividad.',
      'Es clave aprender nuevas herramientas.',
      'El futuro del trabajo es híbrido.',
    ],
  },
  repurpose: {
    twitterThread: [
      { position: 1, content: 'Primer tweet del hilo' },
      { position: 2, content: 'Segundo tweet' },
      { position: 3, content: 'Tercer tweet' },
      { position: 4, content: 'Cuarto tweet' },
      { position: 5, content: 'Quinto tweet' },
      { position: 6, content: 'Sexto tweet' },
      { position: 7, content: 'Séptimo tweet' },
    ],
    shortScript: {
      hook: 'Gancho del short',
      body: 'Contenido principal del short.',
      cta: 'Suscríbete para más.',
      suggestedClip: 'Minuto 2:15 sobre el impacto de la IA.',
    },
    linkedinPost: 'Un post de LinkedIn sobre programación con IA.',
    newsletterDraft: {
      subject: 'Lo último en IA',
      body: 'Estimados lectores, hoy hablamos de IA.',
    },
  },
  analysis: {
    sentiment: {
      tone: 'educativo',
      confidence: 0.85,
      explanation: 'El video tiene un tono claramente educativo.',
    },
    entities: [
      {
        name: 'OpenAI',
        type: 'marca',
        context: 'Se menciona como líder en IA.',
      },
      {
        name: 'GPT-4',
        type: 'herramienta',
        context: 'Modelo de lenguaje principal.',
      },
    ],
    suggestedQuestions: [
      '¿Cómo afecta la IA al empleo?',
      '¿Qué herramientas son recomendables?',
      '¿Cuál es el futuro de la programación?',
    ],
  },
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('IntelligenceReport', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  // ── Header ────────────────────────────────────────────────────────────────

  it('renders the heading and formatted date', () => {
    render(<IntelligenceReport report={MOCK_REPORT} />)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /informe de inteligencia/i,
      }),
    ).toBeInTheDocument()

    const timeEl = screen.getByText(/enero/i)
    expect(timeEl).toBeInTheDocument()
    expect(timeEl.closest('time')).toHaveAttribute(
      'datetime',
      '2025-01-15T10:30:00.000Z',
    )
  })

  // ── Tab bar ───────────────────────────────────────────────────────────────

  it('renders three tabs with correct labels', () => {
    render(<IntelligenceReport report={MOCK_REPORT} />)

    const tablist = screen.getByRole('tablist')
    const tabs = within(tablist).getAllByRole('tab')

    expect(tabs).toHaveLength(3)
    expect(tabs[0]).toHaveTextContent('Resumen')
    expect(tabs[1]).toHaveTextContent('Reutilizar Contenido')
    expect(tabs[2]).toHaveTextContent('Análisis Profundo')
  })

  // ── Default tab (summary) ─────────────────────────────────────────────────

  it('shows summary content by default', () => {
    render(<IntelligenceReport report={MOCK_REPORT} />)

    expect(screen.getByText(/TL;DW/)).toBeInTheDocument()
    expect(
      screen.getByText(MOCK_REPORT.summary.tldr.context),
    ).toBeInTheDocument()
  })

  // ── Tab switching: repurpose ──────────────────────────────────────────────

  it('shows repurpose content when its tab is clicked', async () => {
    const user = userEvent.setup()
    render(<IntelligenceReport report={MOCK_REPORT} />)

    await user.click(screen.getByRole('tab', { name: 'Reutilizar Contenido' }))

    expect(screen.getByText('Hilo de Twitter')).toBeInTheDocument()
    expect(screen.getByText('Primer tweet del hilo')).toBeInTheDocument()

    // Summary content should no longer be visible
    expect(screen.queryByText(/TL;DW/)).not.toBeInTheDocument()
  })

  // ── Tab switching: analysis ───────────────────────────────────────────────

  it('shows analysis content when its tab is clicked', async () => {
    const user = userEvent.setup()
    render(<IntelligenceReport report={MOCK_REPORT} />)

    await user.click(screen.getByRole('tab', { name: 'Análisis Profundo' }))

    expect(screen.getByText('Análisis de Sentimiento')).toBeInTheDocument()
    expect(screen.getByText('Educativo')).toBeInTheDocument()

    // Summary content should no longer be visible
    expect(screen.queryByText(/TL;DW/)).not.toBeInTheDocument()
  })

  // ── aria-selected ─────────────────────────────────────────────────────────

  it('marks only the active tab with aria-selected="true"', async () => {
    const user = userEvent.setup()
    render(<IntelligenceReport report={MOCK_REPORT} />)

    const [summary, repurpose, analysis] = screen.getAllByRole('tab')

    // Default state — summary active
    expect(summary).toHaveAttribute('aria-selected', 'true')
    expect(repurpose).toHaveAttribute('aria-selected', 'false')
    expect(analysis).toHaveAttribute('aria-selected', 'false')

    // Switch to repurpose
    await user.click(repurpose)
    expect(summary).toHaveAttribute('aria-selected', 'false')
    expect(repurpose).toHaveAttribute('aria-selected', 'true')
    expect(analysis).toHaveAttribute('aria-selected', 'false')
  })

  // ── Tab panel aria attributes ─────────────────────────────────────────────

  it('renders tab panel with correct role and aria-labelledby', async () => {
    const user = userEvent.setup()
    render(<IntelligenceReport report={MOCK_REPORT} />)

    // Default: summary panel
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveAttribute('id', 'panel-summary')
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-summary')

    // Switch to analysis — panel attributes update
    await user.click(screen.getByRole('tab', { name: 'Análisis Profundo' }))

    const updatedPanel = screen.getByRole('tabpanel')
    expect(updatedPanel).toHaveAttribute('id', 'panel-analysis')
    expect(updatedPanel).toHaveAttribute('aria-labelledby', 'tab-analysis')
  })
})
