// @vitest-environment jsdom
/**
 * Tests for NuevoVideoPage — Client Component
 *
 * Uses React Testing Library + jsdom.
 * `ingestVideo` is mocked via vi.mock so we can control Server Action responses.
 */
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { IngestResult } from '@/lib/pipeline/types'
import { INGEST_ERROR } from '@/lib/pipeline/types'

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock the ingestVideo Server Action
const mockIngestVideo = vi.fn()

vi.mock('@/lib/pipeline/ingest', () => ({
  ingestVideo: (...args: unknown[]) => mockIngestVideo(...args),
}))

// next/link renders as a plain <a> in tests
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

// ─── Import (after mocks) ─────────────────────────────────────────────────────

import NuevoVideoPage from './page'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

function resolveWith(result: IngestResult) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(mockIngestVideo as any).mockResolvedValueOnce(result)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NuevoVideoPage', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  // ── Idle state ──────────────────────────────────────────────────────────────

  it('renders the idle form state', () => {
    render(<NuevoVideoPage />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Añadir video',
    )
    expect(screen.getByLabelText(/URL de YouTube/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /analizar video/i }),
    ).toBeDisabled()
  })

  it('enables the submit button when a URL is typed', async () => {
    const user = userEvent.setup()
    render(<NuevoVideoPage />)

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

    render(<NuevoVideoPage />)

    await user.type(screen.getByLabelText(/URL de YouTube/i), VALID_URL)
    await user.click(screen.getByRole('button', { name: /analizar video/i }))

    // Phase label for the first step should be visible
    expect(screen.getByText(/extrayendo transcripción/i)).toBeInTheDocument()
    // Submit button should be gone while loading
    expect(
      screen.queryByRole('button', { name: /analizar video/i }),
    ).not.toBeInTheDocument()
  })

  // ── Success state ────────────────────────────────────────────────────────────

  it('renders SuccessCard on successful ingestion', async () => {
    const user = userEvent.setup()
    resolveWith({ ok: true, videoId: 'vid-abc', sectionCount: 12 })

    render(<NuevoVideoPage />)

    await user.type(screen.getByLabelText(/URL de YouTube/i), VALID_URL)
    await user.click(screen.getByRole('button', { name: /analizar video/i }))

    await waitFor(() => {
      expect(screen.getByText('¡Video indexado!')).toBeInTheDocument()
    })

    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText(/fragmentos en memoria/i)).toBeInTheDocument()
  })

  it('resets form when "Añadir otro video" is clicked', async () => {
    const user = userEvent.setup()
    resolveWith({ ok: true, videoId: 'vid-abc', sectionCount: 5 })

    render(<NuevoVideoPage />)

    await user.type(screen.getByLabelText(/URL de YouTube/i), VALID_URL)
    await user.click(screen.getByRole('button', { name: /analizar video/i }))

    await waitFor(() => {
      expect(screen.getByText('¡Video indexado!')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /añadir otro video/i }))

    // Form is back, URL is cleared
    expect(screen.getByLabelText(/URL de YouTube/i)).toHaveValue('')
    expect(
      screen.getByRole('button', { name: /analizar video/i }),
    ).toBeDisabled()
  })

  // ── Error state — known error codes ─────────────────────────────────────────

  it('shows mapped message for INVALID_URL error code', async () => {
    const user = userEvent.setup()
    resolveWith({
      ok: false,
      code: INGEST_ERROR.INVALID_URL,
      message: 'Invalid transcript response.',
    })

    render(<NuevoVideoPage />)

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

    render(<NuevoVideoPage />)

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

    render(<NuevoVideoPage />)

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

    render(<NuevoVideoPage />)

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

    render(<NuevoVideoPage />)

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

    render(<NuevoVideoPage />)

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

    render(<NuevoVideoPage />)

    await user.type(screen.getByLabelText(/URL de YouTube/i), VALID_URL)
    await user.click(screen.getByRole('button', { name: /analizar video/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/error inesperado/i)
    })
  })
})
