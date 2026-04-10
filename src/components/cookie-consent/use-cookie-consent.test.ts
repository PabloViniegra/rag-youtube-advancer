// @vitest-environment jsdom
/**
 * Tests for useCookieConsent hook.
 */
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CONSENT_STORAGE_KEY,
  CONSENT_VALUE,
  useCookieConsent,
} from './use-cookie-consent'

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

describe('useCookieConsent', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('showBanner is true when no consent has been stored', async () => {
    installFreshLocalStorage()
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => {})

    expect(result.current.showBanner).toBe(true)
    expect(result.current.consentValue).toBeNull()
  })

  it('showBanner is false when consent is already accepted', async () => {
    installFreshLocalStorage({ [CONSENT_STORAGE_KEY]: CONSENT_VALUE.ACCEPTED })
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => {})

    expect(result.current.showBanner).toBe(false)
    expect(result.current.consentValue).toBe(CONSENT_VALUE.ACCEPTED)
  })

  it('showBanner is false when consent is already declined', async () => {
    installFreshLocalStorage({ [CONSENT_STORAGE_KEY]: CONSENT_VALUE.DECLINED })
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => {})

    expect(result.current.showBanner).toBe(false)
    expect(result.current.consentValue).toBe(CONSENT_VALUE.DECLINED)
  })

  it('accept() stores accepted value and hides the banner', async () => {
    const mock = installFreshLocalStorage()
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => {})
    expect(result.current.showBanner).toBe(true)

    act(() => {
      result.current.accept()
    })

    expect(result.current.consentValue).toBe(CONSENT_VALUE.ACCEPTED)
    expect(result.current.showBanner).toBe(false)
    expect(mock.setItem).toHaveBeenCalledWith(
      CONSENT_STORAGE_KEY,
      CONSENT_VALUE.ACCEPTED,
    )
  })

  it('decline() stores declined value and hides the banner', async () => {
    const mock = installFreshLocalStorage()
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => {})
    expect(result.current.showBanner).toBe(true)

    act(() => {
      result.current.decline()
    })

    expect(result.current.consentValue).toBe(CONSENT_VALUE.DECLINED)
    expect(result.current.showBanner).toBe(false)
    expect(mock.setItem).toHaveBeenCalledWith(
      CONSENT_STORAGE_KEY,
      CONSENT_VALUE.DECLINED,
    )
  })

  it('treats unknown stored values as no consent', async () => {
    installFreshLocalStorage({ [CONSENT_STORAGE_KEY]: 'unknown-value' })
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => {})

    expect(result.current.showBanner).toBe(true)
    expect(result.current.consentValue).toBeNull()
  })

  it('handles localStorage read errors gracefully', async () => {
    const mock = installFreshLocalStorage()
    mock.getItem.mockImplementation(() => {
      throw new Error('Storage unavailable')
    })
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => {})

    // Should show the banner when storage is unavailable
    expect(result.current.showBanner).toBe(true)
    expect(result.current.consentValue).toBeNull()
  })

  it('handles localStorage write errors gracefully', async () => {
    const mock = installFreshLocalStorage()
    mock.setItem.mockImplementation(() => {
      throw new Error('Storage full')
    })
    const { result } = renderHook(() => useCookieConsent())

    await act(async () => {})

    // Should not throw even when write fails
    expect(() => {
      act(() => {
        result.current.accept()
      })
    }).not.toThrow()
  })

  describe('beforeEach resets mock isolation (sanity)', () => {
    beforeEach(() => {
      installFreshLocalStorage()
    })

    it('does not bleed state from previous tests', async () => {
      const { result } = renderHook(() => useCookieConsent())
      await act(async () => {})
      expect(result.current.showBanner).toBe(true)
    })
  })
})
