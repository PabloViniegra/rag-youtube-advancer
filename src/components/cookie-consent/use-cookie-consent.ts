'use client'

import { useEffect, useState } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

export const CONSENT_STORAGE_KEY = 'cookie-consent'

export const CONSENT_VALUE = {
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
} as const

export type ConsentValue = (typeof CONSENT_VALUE)[keyof typeof CONSENT_VALUE]

// ─── Storage helpers ──────────────────────────────────────────────────────────

function readStoredConsent(): ConsentValue | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (
      stored === CONSENT_VALUE.ACCEPTED ||
      stored === CONSENT_VALUE.DECLINED
    ) {
      return stored
    }
    return null
  } catch {
    // Private browsing or quota errors — treat as no consent
    return null
  }
}

function writeStoredConsent(value: ConsentValue): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, value)
  } catch {
    // Ignore storage errors (private browsing, quota exceeded)
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseCookieConsentReturn {
  consentValue: ConsentValue | null
  showBanner: boolean
  accept: () => void
  decline: () => void
}

export function useCookieConsent(): UseCookieConsentReturn {
  const [consentValue, setConsentValue] = useState<ConsentValue | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setConsentValue(readStoredConsent())
    setHydrated(true)
  }, [])

  function accept() {
    writeStoredConsent(CONSENT_VALUE.ACCEPTED)
    setConsentValue(CONSENT_VALUE.ACCEPTED)
  }

  function decline() {
    writeStoredConsent(CONSENT_VALUE.DECLINED)
    setConsentValue(CONSENT_VALUE.DECLINED)
  }

  return {
    consentValue,
    showBanner: hydrated && consentValue === null,
    accept,
    decline,
  }
}
