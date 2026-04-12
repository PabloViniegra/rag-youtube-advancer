// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VideoSearchEmptyState } from './video-search-empty-state'

describe('VideoSearchEmptyState', () => {
  afterEach(() => cleanup())

  it('renders without crashing', () => {
    const { container } = render(
      <VideoSearchEmptyState query="tutorial" onClear={vi.fn()} />,
    )
    expect(container).toBeTruthy()
  })

  it('shows the search query inside the no-results message', () => {
    render(<VideoSearchEmptyState query="tutorial react" onClear={vi.fn()} />)
    expect(screen.getByText(/tutorial react/i)).toBeInTheDocument()
  })

  it('shows a hint asking the user to try a different term', () => {
    render(<VideoSearchEmptyState query="foo" onClear={vi.fn()} />)
    expect(screen.getByText(/Prueba con otro término/i)).toBeInTheDocument()
  })

  it('renders the "Limpiar búsqueda" button', () => {
    render(<VideoSearchEmptyState query="foo" onClear={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: /Limpiar búsqueda/i }),
    ).toBeInTheDocument()
  })

  it('calls onClear when the "Limpiar búsqueda" button is clicked', async () => {
    const onClear = vi.fn()
    render(<VideoSearchEmptyState query="foo" onClear={onClear} />)
    await userEvent.click(
      screen.getByRole('button', { name: /Limpiar búsqueda/i }),
    )
    expect(onClear).toHaveBeenCalledOnce()
  })
})
