// @vitest-environment jsdom
/**
 * Tests for CookieConsent component.
 */
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CookieConsent } from './cookie-consent'
import { CONSENT_STORAGE_KEY, CONSENT_VALUE } from './use-cookie-consent'

// ─── Helpers ──────────────────────────────────────────────────────────────────

type LocalStorageMock = {
  getItem: ReturnType<typeof vi.fn>
  setItem: ReturnType<typeof vi.fn>
  removeItem: ReturnType<typeof vi.fn>
  clear: ReturnType<typeof vi.fn>
}

function installFreshLocalStorage(
  initial: Record<string, string> = {},
): LocalStorageMock {
  const store: Record<string, string> = { ...initial }
  const mock: LocalStorageMock = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      for (const key of Object.keys(store)) delete store[key]
    }),
  }
  Object.defineProperty(window, 'localStorage', {
    value: mock,
    writable: true,
    configurable: true,
  })
  return mock
}

// ─── Tests ────────────────────────────────────────────────────────────────────

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('CookieConsent', () => {
  it('renders the consent banner when no consent is stored', async () => {
    installFreshLocalStorage()
    render(<CookieConsent />)

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('We use cookies')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Accept all' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument()
  })

  it('does not render when consent was previously accepted', async () => {
    installFreshLocalStorage({
      [CONSENT_STORAGE_KEY]: CONSENT_VALUE.ACCEPTED,
    })
    const { container } = render(<CookieConsent />)

    await vi.waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })

  it('does not render when consent was previously declined', async () => {
    installFreshLocalStorage({
      [CONSENT_STORAGE_KEY]: CONSENT_VALUE.DECLINED,
    })
    const { container } = render(<CookieConsent />)

    await vi.waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })

  it('hides banner and persists accepted state when Accept all is clicked', async () => {
    const mock = installFreshLocalStorage()
    const user = userEvent.setup()
    render(<CookieConsent />)

    const acceptButton = await screen.findByRole('button', {
      name: 'Accept all',
    })
    await user.click(acceptButton)

    expect(mock.setItem).toHaveBeenCalledWith(
      CONSENT_STORAGE_KEY,
      CONSENT_VALUE.ACCEPTED,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('hides banner and persists declined state when Decline is clicked', async () => {
    const mock = installFreshLocalStorage()
    const user = userEvent.setup()
    render(<CookieConsent />)

    const declineButton = await screen.findByRole('button', { name: 'Decline' })
    await user.click(declineButton)

    expect(mock.setItem).toHaveBeenCalledWith(
      CONSENT_STORAGE_KEY,
      CONSENT_VALUE.DECLINED,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('has the correct accessible description', async () => {
    installFreshLocalStorage()
    render(<CookieConsent />)

    await screen.findByRole('dialog')

    expect(
      screen.getByText(/improve your experience and analyse site usage/i),
    ).toBeInTheDocument()
  })

  it('the banner has aria-describedby pointing to the description', async () => {
    installFreshLocalStorage()
    render(<CookieConsent />)

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAttribute(
      'aria-describedby',
      'cookie-banner-description',
    )
    expect(
      document.getElementById('cookie-banner-description'),
    ).toBeInTheDocument()
  })

  it('Accept all button is keyboard accessible via Enter', async () => {
    const mock = installFreshLocalStorage()
    const user = userEvent.setup()
    render(<CookieConsent />)

    const acceptButton = await screen.findByRole('button', {
      name: 'Accept all',
    })
    acceptButton.focus()
    await user.keyboard('{Enter}')

    expect(mock.setItem).toHaveBeenCalledWith(
      CONSENT_STORAGE_KEY,
      CONSENT_VALUE.ACCEPTED,
    )
  })

  it('Decline button is keyboard accessible via Enter', async () => {
    const mock = installFreshLocalStorage()
    const user = userEvent.setup()
    render(<CookieConsent />)

    const declineButton = await screen.findByRole('button', { name: 'Decline' })
    declineButton.focus()
    await user.keyboard('{Enter}')

    expect(mock.setItem).toHaveBeenCalledWith(
      CONSENT_STORAGE_KEY,
      CONSENT_VALUE.DECLINED,
    )
  })
})
