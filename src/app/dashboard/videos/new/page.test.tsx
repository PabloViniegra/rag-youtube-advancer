// @vitest-environment jsdom
/**
 * Tests for the video ingestion form (NewVideoOrchestrator).
 *
 * Uses React Testing Library + jsdom.
 * NuevoVideoPage became an async Server Component after adding auth/plan guards.
 * We test NewVideoOrchestrator directly — it holds all client-side behavior.
 *
 * `ingestVideo` is mocked so we can control Server Action responses.
 */
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { IngestResult } from '@/lib/pipeline/types'
import { INGEST_ERROR } from '@/lib/pipeline/types'

// ─── Mocks ────────────────────────────────────────────────────────────────────

// ViewTransition is a React canary API — shim it so components render in jsdom
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    ViewTransition: ({ children }: { children?: React.ReactNode }) => children,
    addTransitionType: vi.fn(),
  }
})

// Mock next/navigation router
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock the ingestVideo Server Action
const mockIngestVideo = vi.fn()

vi.mock('@/lib/pipeline/ingest', () => ({
  ingestVideo: (...args: unknown[]) => mockIngestVideo(...args),
}))

// ─── Import (after mocks) ─────────────────────────────────────────────────────

import { NewVideoOrchestrator } from './_components/new-video-orchestrator'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

function resolveWith(result: IngestResult) {
  mockIngestVideo.mockResolvedValueOnce(result)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NewVideoOrchestrator (ingest form)', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
    mockPush.mockReset()
  })

  // ── Idle state ──────────────────────────────────────────────────────────────

  it('renders the idle form state', () => {
    render(<NewVideoOrchestrator />)

    expect(screen.getByLabelText(/URL de YouTube/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /analizar video/i }),
    ).toBeDisabled()
  })

  it('enables the submit button when a URL is typed', async () => {
    const user = userEvent.setup()
    render(<NewVideoOrchestrator />)

    await user.type(screen.getByLabelText(/URL de YouTube/i), VALID_URL)

    expect(
      screen.getByRole('button', { name: /analizar video/i }),
    ).not.toBeDisabled()
  })

  // ── Loading state ────────────────────────────────────────────────────────────

  it('shows PhaseProgress while the action is in-flight', async () => {
    const user = userEvent.setup()
    // Never-resolving promise keeps loading state indefinitely
    mockIngestVideo.mockReturnValueOnce(new Promise(() => {}))

    render(<NewVideoOrchestrator />)

    await user.type(screen.getByLabelText(/URL de YouTube/i), VALID_URL)
    await user.click(screen.getByRole('button', { name: /analizar video/i }))

    // Phase label for the first step should be visible
    expect(screen.getByText(/extrayendo transcripción/i)).toBeInTheDocument()
    // Submit button should be gone while loading
    expect(
      screen.queryByRole('button', { name: /analizar video/i }),
    ).not.toBeInTheDocument()
  })

  // ── Success state — redirect ─────────────────────────────────────────────────

  it('shows SuccessCard after successful ingestion', async () => {
    const user = userEvent.setup()
    resolveWith({
      ok: true,
      videoId: 'vid-abc',
      sectionCount: 12,
      report: {
        summary: {
          tldr: { context: 'c', mainArgument: 'm', conclusion: 'x' },
          timestamps: [],
          keyTakeaways: ['a', 'b', 'c', 'd', 'e'],
        },
        repurpose: {
          twitterThread: [
            { position: 1, content: '1' },
            { position: 2, content: '2' },
            { position: 3, content: '3' },
            { position: 4, content: '4' },
            { position: 5, content: '5' },
            { position: 6, content: '6' },
            { position: 7, content: '7' },
          ],
          shortScript: { hook: 'h', body: 'b', cta: 'c', suggestedClip: 's' },
          linkedinPost: 'l',
          newsletterDraft: { subject: 'sub', body: 'body' },
        },
        analysis: {
          sentiment: { tone: 'educativo', confidence: 0.9, explanation: 'ok' },
          entities: [],
          suggestedQuestions: ['q1', 'q2', 'q3'],
        },
        generatedAt: '2024-01-01T00:00:00.000Z',
      },
      seoReport: {
        seoPackage: {
          titleVariants: [
            { variant: 'A', title: 'a', rationale: 'ra' },
            { variant: 'B', title: 'b', rationale: 'rb' },
            { variant: 'C', title: 'c', rationale: 'rc' },
          ],
          description: 'desc',
          tags: [
            't1',
            't2',
            't3',
            't4',
            't5',
            't6',
            't7',
            't8',
            't9',
            't10',
            't11',
            't12',
            't13',
            't14',
            't15',
          ],
        },
        showNotes: {
          episodeTitle: 'ep',
          description: 'desc',
          resources: [],
          suggestedLinks: ['l1', 'l2'],
        },
        thumbnailBrief: {
          mainElement: 'm',
          textOverlay: 'to',
          emotionalTone: 'trust',
          composition: 'comp',
          colorSuggestions: ['a', 'b', 'c', 'd'],
        },
        generatedAt: '2024-01-01T00:00:00.000Z',
      },
    })

    render(<NewVideoOrchestrator />)

    await user.type(screen.getByLabelText(/URL de YouTube/i), VALID_URL)
    await user.click(screen.getByRole('button', { name: /analizar video/i }))

    await waitFor(
      () => {
        expect(
          screen.getByRole('heading', { name: '¡Video indexado!' }),
        ).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
    // router.push is NOT called here — navigation happens only when the user
    // explicitly clicks "Ver video" inside SuccessCard
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows SuccessCard after phases complete on success', async () => {
    const user = userEvent.setup()

    resolveWith({
      ok: true,
      videoId: 'vid-phases',
      sectionCount: 10,
      report: {
        summary: {
          tldr: { context: 'c', mainArgument: 'm', conclusion: 'x' },
          timestamps: [],
          keyTakeaways: ['a', 'b', 'c', 'd', 'e'],
        },
        repurpose: {
          twitterThread: [
            { position: 1, content: '1' },
            { position: 2, content: '2' },
            { position: 3, content: '3' },
            { position: 4, content: '4' },
            { position: 5, content: '5' },
            { position: 6, content: '6' },
            { position: 7, content: '7' },
          ],
          shortScript: { hook: 'h', body: 'b', cta: 'c', suggestedClip: 's' },
          linkedinPost: 'l',
          newsletterDraft: { subject: 'sub', body: 'body' },
        },
        analysis: {
          sentiment: { tone: 'educativo', confidence: 0.9, explanation: 'ok' },
          entities: [],
          suggestedQuestions: ['q1', 'q2', 'q3'],
        },
        generatedAt: '2024-01-01T00:00:00.000Z',
      },
      seoReport: {
        seoPackage: {
          titleVariants: [
            { variant: 'A', title: 'a', rationale: 'ra' },
            { variant: 'B', title: 'b', rationale: 'rb' },
            { variant: 'C', title: 'c', rationale: 'rc' },
          ],
          description: 'desc',
          tags: [
            't1',
            't2',
            't3',
            't4',
            't5',
            't6',
            't7',
            't8',
            't9',
            't10',
            't11',
            't12',
            't13',
            't14',
            't15',
          ],
        },
        showNotes: {
          episodeTitle: 'ep',
          description: 'desc',
          resources: [],
          suggestedLinks: ['l1', 'l2'],
        },
        thumbnailBrief: {
          mainElement: 'm',
          textOverlay: 'to',
          emotionalTone: 'trust',
          composition: 'comp',
          colorSuggestions: ['a', 'b', 'c', 'd'],
        },
        generatedAt: '2024-01-01T00:00:00.000Z',
      },
    })

    render(<NewVideoOrchestrator />)

    await user.type(screen.getByLabelText(/URL de YouTube/i), VALID_URL)
    await user.click(screen.getByRole('button', { name: /analizar video/i }))

    // router.push is NOT called automatically — user must click "Ver video" in SuccessCard
    expect(mockPush).not.toHaveBeenCalled()

    await waitFor(
      () => {
        expect(
          screen.getByRole('heading', { name: '¡Video indexado!' }),
        ).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
    expect(mockPush).not.toHaveBeenCalled()
  })

  // ── Error state — known error codes ─────────────────────────────────────────

  it('shows mapped message for INVALID_URL error code', async () => {
    const user = userEvent.setup()
    resolveWith({
      ok: false,
      code: INGEST_ERROR.INVALID_URL,
      message: 'Invalid transcript response.',
    })

    render(<NewVideoOrchestrator />)

    await user.type(screen.getByLabelText(/URL de YouTube/i), VALID_URL)
    await user.click(screen.getByRole('button', { name: /analizar video/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'La URL de YouTube no es válida.',
      )
    })
  })

  it('shows mapped message for TRANSCRIPT_FAILED error code', async () => {
    const user = userEvent.setup()
    resolveWith({
      ok: false,
      code: INGEST_ERROR.TRANSCRIPT_FAILED,
      message: 'Transcript extraction failed.',
    })

    render(<NewVideoOrchestrator />)

    await user.type(screen.getByLabelText(/URL de YouTube/i), VALID_URL)
    await user.click(screen.getByRole('button', { name: /analizar video/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudo extraer la transcripción del video.',
      )
    })
  })

  it('shows mapped message for UNAUTHORIZED error code', async () => {
    const user = userEvent.setup()
    resolveWith({
      ok: false,
      code: INGEST_ERROR.UNAUTHORIZED,
      message: '',
    })

    render(<NewVideoOrchestrator />)

    await user.type(screen.getByLabelText(/URL de YouTube/i), VALID_URL)
    await user.click(screen.getByRole('button', { name: /analizar video/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Debes iniciar sesión para añadir videos.',
      )
    })
  })

  it('shows mapped message for FORBIDDEN error code', async () => {
    const user = userEvent.setup()
    resolveWith({
      ok: false,
      code: INGEST_ERROR.FORBIDDEN,
      message: '',
    })

    render(<NewVideoOrchestrator />)

    await user.type(screen.getByLabelText(/URL de YouTube/i), VALID_URL)
    await user.click(screen.getByRole('button', { name: /analizar video/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Necesitas una suscripción activa para añadir videos.',
      )
    })
  })

  // ── Error state — custom / passthrough messages ───────────────────────────

  it('passes through non-generic custom error messages verbatim', async () => {
    const user = userEvent.setup()
    resolveWith({
      ok: false,
      code: INGEST_ERROR.STORE_FAILED,
      message: 'Custom upstream error from the store API.',
    })

    render(<NewVideoOrchestrator />)

    await user.type(screen.getByLabelText(/URL de YouTube/i), VALID_URL)
    await user.click(screen.getByRole('button', { name: /analizar video/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Custom upstream error from the store API.',
      )
    })
  })

  it('uses fallback message when code is unmapped and message is empty', async () => {
    const user = userEvent.setup()
    // Cast to use a code not present in ERROR_MESSAGES
    resolveWith({
      ok: false,
      code: 'unknown_code' as (typeof INGEST_ERROR)[keyof typeof INGEST_ERROR],
      message: '',
    })

    render(<NewVideoOrchestrator />)

    await user.type(screen.getByLabelText(/URL de YouTube/i), VALID_URL)
    await user.click(screen.getByRole('button', { name: /analizar video/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Error inesperado. Inténtalo de nuevo.',
      )
    })
  })

  // ── Unexpected throw ─────────────────────────────────────────────────────────

  it('shows error banner when ingestVideo throws unexpectedly', async () => {
    const user = userEvent.setup()
    mockIngestVideo.mockRejectedValueOnce(new Error('boom'))

    render(<NewVideoOrchestrator />)

    await user.type(screen.getByLabelText(/URL de YouTube/i), VALID_URL)
    await user.click(screen.getByRole('button', { name: /analizar video/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/error inesperado/i)
    })
  })
})
