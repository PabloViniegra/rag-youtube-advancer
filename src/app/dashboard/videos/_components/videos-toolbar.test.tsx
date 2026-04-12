// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const { mockPush, mockReplace } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
}))

let mockSearchParams: URLSearchParams

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}))

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    ViewTransition: ({ children }: { children: React.ReactNode }) => children,
  }
})

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { VideosToolbar } from './videos-toolbar'

// ─── Helper ───────────────────────────────────────────────────────────────────

function renderToolbar(
  overrides: Partial<React.ComponentProps<typeof VideosToolbar>> = {},
) {
  return render(
    <VideosToolbar
      onQueryChange={vi.fn()}
      totalCount={10}
      filteredCount={10}
      {...overrides}
    />,
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('VideosToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders the search input', () => {
    renderToolbar()
    expect(
      screen.getByRole('searchbox', { name: /buscar/i }),
    ).toBeInTheDocument()
  })

  it('renders the sort pill-tab group', () => {
    renderToolbar()
    expect(screen.getByRole('group', { name: /ordenar/i })).toBeInTheDocument()
  })

  it('shows all four sort pill buttons', () => {
    renderToolbar()
    expect(
      screen.getByRole('button', { name: 'Más recientes' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Más antiguos' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Título A → Z' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Título Z → A' }),
    ).toBeInTheDocument()
  })

  // ── Default / URL state ────────────────────────────────────────────────────

  it('marks "Más recientes" as pressed by default', () => {
    renderToolbar()
    const btn = screen.getByRole('button', { name: 'Más recientes' })
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('reads active sort from URL ?sort= param', () => {
    mockSearchParams = new URLSearchParams('sort=oldest')
    renderToolbar()
    const btn = screen.getByRole('button', { name: 'Más antiguos' })
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('initialises search input from URL ?q= param', () => {
    mockSearchParams = new URLSearchParams('q=typescript')
    renderToolbar()
    const input = screen.getByRole('searchbox', {
      name: /buscar/i,
    }) as HTMLInputElement
    expect(input.value).toBe('typescript')
  })

  // ── Search behaviour ───────────────────────────────────────────────────────

  it('debounces onQueryChange by 250 ms', () => {
    const onQueryChange = vi.fn()
    renderToolbar({ onQueryChange })
    const input = screen.getByRole('searchbox', { name: /buscar/i })

    fireEvent.change(input, { target: { value: 'react' } })
    expect(onQueryChange).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(onQueryChange).toHaveBeenCalledWith('react')
    expect(onQueryChange).toHaveBeenCalledTimes(1)
  })

  it('persists query in URL immediately via router.replace', () => {
    renderToolbar()
    const input = screen.getByRole('searchbox', { name: /buscar/i })
    fireEvent.change(input, { target: { value: 'hooks' } })
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('q=hooks'),
      expect.objectContaining({ scroll: false }),
    )
  })

  it('removes ?q= from URL when search is cleared', () => {
    mockSearchParams = new URLSearchParams('q=old')
    renderToolbar()
    const input = screen.getByRole('searchbox', { name: /buscar/i })
    fireEvent.change(input, { target: { value: '' } })
    // param deleted → URL should not contain q=
    expect(mockReplace).toHaveBeenCalledWith(
      expect.not.stringContaining('q='),
      expect.objectContaining({ scroll: false }),
    )
  })

  // ── Sort behaviour ─────────────────────────────────────────────────────────

  it('calls router.push with the new sort param when a pill is clicked', () => {
    renderToolbar()
    const btn = screen.getByRole('button', { name: 'Más antiguos' })
    fireEvent.click(btn)
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('sort=oldest'),
      expect.objectContaining({ scroll: false }),
    )
  })

  it('removes the sort param when the default pill is re-selected', () => {
    mockSearchParams = new URLSearchParams('sort=oldest')
    renderToolbar()
    const btn = screen.getByRole('button', { name: 'Más recientes' })
    fireEvent.click(btn)
    expect(mockPush).toHaveBeenCalledWith(
      '?',
      expect.objectContaining({ scroll: false }),
    )
  })

  // ── Count display ──────────────────────────────────────────────────────────

  it('hides the result count when there is no active search', () => {
    renderToolbar({ totalCount: 10, filteredCount: 10 })
    // The count badge reads "X de Y videos" — only shown when a search is active
    expect(screen.queryByText(/\d+ de \d+/i)).not.toBeInTheDocument()
  })

  it('shows "X de Y videos" when search is active and filters results', () => {
    mockSearchParams = new URLSearchParams('q=react')
    renderToolbar({ totalCount: 10, filteredCount: 3 })
    // The component shows the count only when hasActiveSearch AND filteredCount !== totalCount
    // Since the URL has q=, the input initialises with 'react' → hasActiveSearch = true
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  // ── Keyboard shortcut badge ────────────────────────────────────────────────

  it('shows the keyboard shortcut badge when input is empty and unfocused', () => {
    renderToolbar()
    expect(document.querySelector('kbd')).toBeInTheDocument()
  })

  it('hides the kbd badge when the input has content', () => {
    renderToolbar()
    const input = screen.getByRole('searchbox', { name: /buscar/i })
    fireEvent.change(input, { target: { value: 'react' } })
    expect(document.querySelector('kbd')).not.toBeInTheDocument()
  })

  // ── Keyboard shortcut focus ────────────────────────────────────────────────

  it('Ctrl+F focuses the search input', () => {
    renderToolbar()
    const input = screen.getByRole('searchbox', { name: /buscar/i })
    fireEvent.keyDown(document, { key: 'f', ctrlKey: true })
    expect(document.activeElement).toBe(input)
  })

  it('Meta+F focuses the search input', () => {
    renderToolbar()
    const input = screen.getByRole('searchbox', { name: /buscar/i })
    fireEvent.keyDown(document, { key: 'f', metaKey: true })
    expect(document.activeElement).toBe(input)
  })
})
