// @vitest-environment jsdom
/**
 * Tests for SearchPage — Client Component
 *
 * Uses React Testing Library + jsdom. `fetch` is mocked globally so we
 * can control /api/augment responses without a real server.
 */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────

// ViewTransition is a React canary API — shim it so components render in jsdom
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    ViewTransition: ({ children }: { children?: React.ReactNode }) => children,
  }
})

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

// LibraryStatus has its own fetch lifecycle and is tested separately; mock it
// here so SearchPage tests focus on the query/answer state machine.
vi.mock('./_components/library-status', () => ({
  LibraryStatus: () => null,
}))

// ─── Import (after mocks) ─────────────────────────────────────────────────────

import SearchPage from './page'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch(status: number, body: unknown) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SearchPage', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders the initial idle state', () => {
    render(<SearchPage />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Buscar en mis videos',
    )
    expect(screen.getByLabelText(/tu pregunta/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /buscar/i })).toBeDisabled()
  })

  it('enables the submit button when query is typed', async () => {
    const user = userEvent.setup()
    render(<SearchPage />)

    const textarea = screen.getByLabelText(/tu pregunta/i)
    await user.type(textarea, '¿Qué es React?')

    expect(screen.getByRole('button', { name: /buscar/i })).not.toBeDisabled()
  })

  it('shows loading spinner while request is in-flight', async () => {
    const user = userEvent.setup()

    // Never-resolving fetch to keep loading state
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(new Promise(() => {}))

    render(<SearchPage />)

    await user.type(screen.getByLabelText(/tu pregunta/i), '¿Qué es React?')
    await user.click(screen.getByRole('button', { name: /buscar/i }))

    expect(screen.getByText(/buscando en tus videos/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /buscar/i })).toBeDisabled()
  })

  it('renders the answer and sources on success', async () => {
    const user = userEvent.setup()

    mockFetch(200, {
      answer: 'React es una librería de UI.',
      sources: [
        {
          id: 'sec-1',
          videoId: 'vid-1',
          content: 'React simplifica el desarrollo de interfaces.',
          similarity: 0.95,
        },
      ],
      sourceCount: 1,
    })

    render(<SearchPage />)

    await user.type(screen.getByLabelText(/tu pregunta/i), '¿Qué es React?')
    await user.click(screen.getByRole('button', { name: /buscar/i }))

    await waitFor(() => {
      expect(
        screen.getByText('React es una librería de UI.'),
      ).toBeInTheDocument()
    })

    expect(screen.getByText(/Fuente 1/i)).toBeInTheDocument()
    expect(
      screen.getByText('React simplifica el desarrollo de interfaces.'),
    ).toBeInTheDocument()
  })

  it('shows error banner on non-ok API response', async () => {
    const user = userEvent.setup()

    mockFetch(500, { error: 'Error interno del servidor' })

    render(<SearchPage />)

    await user.type(screen.getByLabelText(/tu pregunta/i), '¿Qué es React?')
    await user.click(screen.getByRole('button', { name: /buscar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Error interno del servidor',
      )
    })
  })

  it('shows a friendly message for no-context responses', async () => {
    const user = userEvent.setup()

    mockFetch(404, {
      code: 'no_context',
      error:
        'No encontré contexto suficiente para esa pregunta. Prueba con otras palabras o menciona una idea concreta del video.',
    })

    render(<SearchPage />)

    await user.type(screen.getByLabelText(/tu pregunta/i), 'Dame un título')
    await user.click(screen.getByRole('button', { name: /buscar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /No encontré contexto suficiente/i,
      )
    })
  })

  it('normalizes legacy no-context copy into friendly text', async () => {
    const user = userEvent.setup()

    mockFetch(404, {
      code: 'no_context',
      error: 'No relevant video sections found for the given query.',
    })

    render(<SearchPage />)

    await user.type(screen.getByLabelText(/tu pregunta/i), 'Dame un título')
    await user.click(screen.getByRole('button', { name: /buscar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /No encontré contexto suficiente/i,
      )
    })
    expect(screen.queryByText(/No relevant video sections found/i)).toBeNull()
  })

  it('shows quick suggestions for no-context responses', async () => {
    const user = userEvent.setup()

    mockFetch(404, {
      code: 'no_context',
      error:
        'No encontré contexto suficiente para esa pregunta. Prueba con otras palabras o menciona una idea concreta del video.',
    })

    render(<SearchPage />)

    await user.type(screen.getByLabelText(/tu pregunta/i), 'Dame un título')
    await user.click(screen.getByRole('button', { name: /buscar/i }))

    await waitFor(() => {
      expect(screen.getByText(/Prueba con:/i)).toBeInTheDocument()
    })

    expect(
      screen.getByRole('button', {
        name: /Resúmeme este video en 5 puntos clave/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /Dame 3 ideas principales del video/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /Dame un título más atractivo basado en el contenido\./i,
      }),
    ).toBeInTheDocument()
  })

  it('fills the textarea when a no-context suggestion is clicked', async () => {
    const user = userEvent.setup()

    mockFetch(404, {
      code: 'no_context',
      error:
        'No encontré contexto suficiente para esa pregunta. Prueba con otras palabras o menciona una idea concreta del video.',
    })

    render(<SearchPage />)

    await user.type(screen.getByLabelText(/tu pregunta/i), 'Dame un título')
    await user.click(screen.getByRole('button', { name: /buscar/i }))

    const suggestionButton = await screen.findByRole('button', {
      name: /Dame 3 ideas principales del video/i,
    })
    await user.click(suggestionButton)

    expect(screen.getByLabelText(/tu pregunta/i)).toHaveValue(
      'Dame 3 ideas principales del video.',
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows generic error banner on network failure', async () => {
    const user = userEvent.setup()

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
      new Error('network error'),
    )

    render(<SearchPage />)

    await user.type(screen.getByLabelText(/tu pregunta/i), '¿Qué es React?')
    await user.click(screen.getByRole('button', { name: /buscar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /no se pudo conectar/i,
      )
    })
  })

  it('does not submit when query is only whitespace', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    render(<SearchPage />)

    const textarea = screen.getByLabelText(/tu pregunta/i)
    await user.type(textarea, '   ')
    // Button should remain disabled
    expect(screen.getByRole('button', { name: /buscar/i })).toBeDisabled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('shows sources count heading when sources are present', async () => {
    const user = userEvent.setup()

    mockFetch(200, {
      answer: 'La respuesta.',
      sources: [
        {
          id: 'sec-1',
          videoId: 'vid-1',
          content: 'Context A',
          similarity: 0.85,
        },
        {
          id: 'sec-2',
          videoId: 'vid-1',
          content: 'Context B',
          similarity: 0.6,
        },
      ],
      sourceCount: 2,
    })

    render(<SearchPage />)

    await user.type(screen.getByLabelText(/tu pregunta/i), 'test')
    await user.click(screen.getByRole('button', { name: /buscar/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/qué encontré en tus videos \(2\)/i),
      ).toBeInTheDocument()
    })
  })

  it('ignores AbortError when component unmounts during fetch', async () => {
    const user = userEvent.setup()

    const abortError = new Error('Aborted')
    abortError.name = 'AbortError'
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(abortError)

    const { unmount } = render(<SearchPage />)

    await user.type(screen.getByLabelText(/tu pregunta/i), 'test query')
    fireEvent.submit(
      screen.getByRole('button', { name: /buscar/i }).closest('form')!,
    )

    // Unmount before the promise resolves
    unmount()

    // No error should be thrown — no state update on unmounted component
    await waitFor(() => {}, { timeout: 100 })
  })
})
