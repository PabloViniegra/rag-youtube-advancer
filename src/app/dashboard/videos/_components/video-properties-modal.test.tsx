// @vitest-environment jsdom
/**
 * Tests for VideoPropertiesModal component.
 */
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    ViewTransition: ({ children }: { children: React.ReactNode }) => children,
  }
})

const { getVideoSectionStatsMock } = vi.hoisted(() => ({
  getVideoSectionStatsMock: vi.fn(),
}))

vi.mock('../actions', () => ({
  getVideoSectionStats: getVideoSectionStatsMock,
}))

vi.mock('navigator.clipboard', () => ({
  default: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
}))

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { VideoPropertiesModal } from './video-properties-modal'

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('VideoPropertiesModal', () => {
  const defaultProps = {
    videoId: 'abc123de-uuid-fake-fake-000000000001',
    videoTitle: 'Mi video de prueba',
    youtubeId: 'dQw4w9WgXcQ',
    createdAt: '2024-01-15T10:30:00Z',
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    HTMLDialogElement.prototype.showModal = vi.fn(function (
      this: HTMLDialogElement,
    ) {
      this.setAttribute('open', '')
    })
    HTMLDialogElement.prototype.close = vi.fn(function (
      this: HTMLDialogElement,
    ) {
      this.removeAttribute('open')
    })
    getVideoSectionStatsMock.mockResolvedValue({
      data: { sectionCount: 12, contentSizeChars: 15000 },
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders dialog with basic video metadata', () => {
    render(<VideoPropertiesModal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Propiedades del video')).toBeInTheDocument()
    expect(screen.getByText('Mi video de prueba')).toBeInTheDocument()
  })

  it('shows the YouTube link with correct href', () => {
    render(<VideoPropertiesModal {...defaultProps} />)
    const link = screen.getByRole('link', { name: /youtube/i })
    expect(link).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    )
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('shows full internal ID with copy button', () => {
    render(<VideoPropertiesModal {...defaultProps} />)
    const copyButton = screen.getByRole('button', {
      name: /copiar id interno/i,
    })
    expect(copyButton).toBeInTheDocument()
  })

  it('shows section stats after loading', async () => {
    render(<VideoPropertiesModal {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('15.0 K car.')).toBeInTheDocument()
    })
    expect(getVideoSectionStatsMock).toHaveBeenCalledWith(defaultProps.videoId)
  })

  it('calls onClose when Cerrar button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<VideoPropertiesModal {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  it('renders "Sin título" when videoTitle is null', () => {
    render(<VideoPropertiesModal {...defaultProps} videoTitle={null} />)
    expect(screen.getByText('Sin título')).toBeInTheDocument()
  })

  it('shows small content size without K suffix', async () => {
    getVideoSectionStatsMock.mockResolvedValue({
      data: { sectionCount: 3, contentSizeChars: 500 },
    })
    render(<VideoPropertiesModal {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText('500 car.')).toBeInTheDocument()
    })
  })
})
