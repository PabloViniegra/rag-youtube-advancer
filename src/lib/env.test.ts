import { afterEach, describe, expect, it, vi } from 'vitest'

const ORIGINAL_ENV = { ...process.env }

async function importEnvModule() {
  return await import('./env')
}

describe('env module', () => {
  afterEach(() => {
    vi.resetModules()
    process.env = { ...ORIGINAL_ENV }
  })

  it('loads required env vars when present', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    process.env.NEXT_VERCEL_AI_GATEWAY_API_KEY = 'gateway-key'

    const env = await importEnvModule()

    expect(env.supabaseUrl).toBe('https://example.supabase.co')
    expect(env.supabaseAnonKey).toBe('anon-key')
    expect(env.aiGatewayApiKey).toBe('gateway-key')
  })

  it('throws if a required env var is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    process.env.NEXT_VERCEL_AI_GATEWAY_API_KEY = 'gateway-key'

    await expect(importEnvModule()).rejects.toThrow(
      'Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL',
    )
  })
})
