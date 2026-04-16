import { describe, expect, it, vi, beforeEach } from 'vitest'

describe('robots', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns a robots object with rules, sitemap, and host', async () => {
    const { default: robots } = await import('./robots')
    const result = robots()

    expect(result.rules).toBeDefined()
    expect(result.sitemap).toBeDefined()
    expect(result.host).toBeDefined()
  })

  it('disallows /dashboard/ for all user agents', async () => {
    const { default: robots } = await import('./robots')
    const result = robots()

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
    const allRules = rules.flat()
    const disallowed = allRules.flatMap((r) =>
      Array.isArray(r.disallow) ? r.disallow : r.disallow ? [r.disallow] : [],
    )

    expect(disallowed).toContain('/dashboard/')
  })

  it('disallows /api/ for all user agents', async () => {
    const { default: robots } = await import('./robots')
    const result = robots()

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
    const allRules = rules.flat()
    const disallowed = allRules.flatMap((r) =>
      Array.isArray(r.disallow) ? r.disallow : r.disallow ? [r.disallow] : [],
    )

    expect(disallowed).toContain('/api/')
  })

  it('disallows /_next/ to avoid indexing Next.js internals', async () => {
    const { default: robots } = await import('./robots')
    const result = robots()

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
    const allRules = rules.flat()
    const disallowed = allRules.flatMap((r) =>
      Array.isArray(r.disallow) ? r.disallow : r.disallow ? [r.disallow] : [],
    )

    expect(disallowed).toContain('/_next/')
  })

  it('allows / (home page)', async () => {
    const { default: robots } = await import('./robots')
    const result = robots()

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
    const allRules = rules.flat()
    const allowed = allRules.flatMap((r) =>
      Array.isArray(r.allow) ? r.allow : r.allow ? [r.allow] : [],
    )

    expect(allowed).toContain('/')
  })

  it('sitemap URL points to /sitemap.xml on the configured domain', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://test-domain.app')
    vi.resetModules()
    const { default: robots } = await import('./robots')
    const result = robots()

    expect(result.sitemap).toBe('https://test-domain.app/sitemap.xml')
    vi.unstubAllEnvs()
  })

  it('host matches the configured site URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://test-domain.app')
    vi.resetModules()
    const { default: robots } = await import('./robots')
    const result = robots()

    expect(result.host).toBe('https://test-domain.app')
    vi.unstubAllEnvs()
  })

  it('falls back to default URL when NEXT_PUBLIC_SITE_URL is empty string', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.resetModules()
    const { default: robots } = await import('./robots')
    const result = robots()

    expect(result.host).toBe('https://youtube-intelligence.app')
    expect(result.sitemap).toBe('https://youtube-intelligence.app/sitemap.xml')
    vi.unstubAllEnvs()
  })

  it('does NOT explicitly allow /login in robots rules (noindex pages excluded)', async () => {
    const { default: robots } = await import('./robots')
    const result = robots()

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
    const allRules = rules.flat()
    const allowed = allRules.flatMap((r) =>
      Array.isArray(r.allow) ? r.allow : r.allow ? [r.allow] : [],
    )

    expect(allowed).not.toContain('/login')
  })
})
