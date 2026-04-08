// @vitest-environment jsdom
/**
 * Tests for DeleteVideoModal component.
 */
import { cleanup, render, screen } from '@testing-library/react'
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

const { deleteVideoMock } = vi.hoisted(() => ({
  deleteVideoMock: vi.fn(),
}))

vi.mock('../actions', () => ({
  deleteVideo: deleteVideoMock,
}))

const { sileoSuccessMock, sileoErrorMock } = vi.hoisted(() => ({
  sileoSuccessMock: vi.fn(),
  sileoErrorMock: vi.fn(),
}))

vi.mock('sileo', () => ({
  sileo: {
    success: sileoSuccessMock,
    error: sileoErrorMock,
  },
  Toaster: () => null,
}))

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { DeleteVideoModal } from './delete-video-modal'

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DeleteVideoModal', () => {
  const defaultProps = {
    videoId: 'video-1',
    videoTitle: 'Mi video de prueba',
    onClose: vi.fn(),
    onDeleteOptimistic: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the dialog with video title and impact list', () => {
    render(<DeleteVideoModal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/"Mi video de prueba"/)).toBeInTheDocument()
    expect(
      screen.getByText('Transcripción y secciones vectoriales'),
    ).toBeInTheDocument()
    expect(screen.getByText('Informe de inteligencia')).toBeInTheDocument()
    expect(screen.getByText('Registro del video')).toBeInTheDocument()
  })

  it('calls onClose when Cancelar is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<DeleteVideoModal {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls deleteVideo and shows success toast on confirm', async () => {
    deleteVideoMock.mockResolvedValue({})
    const user = userEvent.setup()
    render(<DeleteVideoModal {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /eliminar/i }))
    await vi.waitFor(() => {
      expect(deleteVideoMock).toHaveBeenCalledWith('video-1')
      expect(sileoSuccessMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Video eliminado' }),
      )
    })
  })

  it('shows error toast when deleteVideo returns an error', async () => {
    deleteVideoMock.mockResolvedValue({
      error: 'No se pudo eliminar el video.',
    })
    const user = userEvent.setup()
    render(<DeleteVideoModal {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /eliminar/i }))
    await vi.waitFor(() => {
      expect(sileoErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'No se pudo eliminar' }),
      )
    })
  })
})
