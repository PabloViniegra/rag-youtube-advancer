import { describe, expect, it, vi, beforeEach } from 'vitest'
import { resolveSiteUrl } from './sitemap'

// ── Note: NEXT_PUBLIC_SITE_URL is not set in vitest.setup.ts.
// We test the function's output structure — not the absolute URL value —
// which lets the test run without any env dependency.

describe('resolveSiteUrl', () => {
  it('returns env var when set to a non-empty string', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://my-app.vercel.app')
    expect(resolveSiteUrl()).toBe('https://my-app.vercel.app')
    vi.unstubAllEnvs()
  })

  it('returns fallback when env var is undefined (not set)', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', undefined as unknown as string)
    expect(resolveSiteUrl()).toBe('https://youtube-intelligence.app')
    vi.unstubAllEnvs()
  })

  it('returns fallback when env var is empty string', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    expect(resolveSiteUrl()).toBe('https://youtube-intelligence.app')
    vi.unstubAllEnvs()
  })
})

describe('sitemap', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns an array with the home page entry', async () => {
    const { default: sitemap } = await import('./sitemap')
    const entries = sitemap()

    expect(entries.length).toBeGreaterThanOrEqual(1)

    const home = entries.find(
      (e) => e.url.endsWith('/') || !e.url.includes('/login'),
    )
    expect(home).toBeDefined()
    expect(home?.priority).toBe(1.0)
    expect(home?.changeFrequency).toBe('weekly')
  })

  it('does NOT include the /login page (noindex pages must be excluded)', async () => {
    const { default: sitemap } = await import('./sitemap')
    const entries = sitemap()

    const loginEntry = entries.find((e) => e.url.includes('/login'))
    expect(loginEntry).toBeUndefined()
  })

  it('does NOT include any dashboard routes', async () => {
    const { default: sitemap } = await import('./sitemap')
    const entries = sitemap()

    const dashboardEntries = entries.filter((e) => e.url.includes('/dashboard'))
    expect(dashboardEntries).toHaveLength(0)
  })

  it('does NOT include any API routes', async () => {
    const { default: sitemap } = await import('./sitemap')
    const entries = sitemap()

    const apiEntries = entries.filter((e) => e.url.includes('/api/'))
    expect(apiEntries).toHaveLength(0)
  })

  it('home entry has a valid lastModified date', async () => {
    const { default: sitemap } = await import('./sitemap')
    const entries = sitemap()

    const home = entries[0]
    expect(home?.lastModified).toBeInstanceOf(Date)
  })

  it('uses NEXT_PUBLIC_SITE_URL env var when set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://custom-domain.app')
    vi.resetModules()
    const { default: sitemap } = await import('./sitemap')
    const entries = sitemap()

    expect(entries[0].url).toBe('https://custom-domain.app')
    vi.unstubAllEnvs()
  })

  it('falls back to default URL when NEXT_PUBLIC_SITE_URL is not set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.resetModules()
    const { default: sitemap } = await import('./sitemap')
    const entries = sitemap()

    // When env is empty string, fallback kicks in
    expect(entries[0].url).toBe('https://youtube-intelligence.app')
    vi.unstubAllEnvs()
  })
})
