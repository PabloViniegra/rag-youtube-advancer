/**
 * Tests for POST /api/chunk
 *
 * Auth is mocked so that we control whether a user session exists.
 * The `chunkText` implementation is tested separately in lib/ai/chunk.test.ts;
 * here we focus on the HTTP layer: parsing, validation, auth, and response shape.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

import { CHUNK_API_ERROR } from '@/lib/ai/types'
import { POST } from './route'

function buildRequest(body: unknown, isInvalidJson = false): Request {
  if (isInvalidJson) {
    return new Request('http://localhost/api/chunk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-valid-json{{{',
    })
  }
  return new Request('http://localhost/api/chunk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function mockAuth(user: { id: string } | null) {
  createClientMock.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('POST /api/chunk', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Auth ──────────────────────────────────────────────────────────────────

  it('returns 401 when user is not authenticated', async () => {
    mockAuth(null)
    const res = await POST(buildRequest({ text: 'hello world' }))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.code).toBe(CHUNK_API_ERROR.INTERNAL_ERROR)
  })

  // ── Body validation ───────────────────────────────────────────────────────

  it('returns 400 when body is not valid JSON', async () => {
    mockAuth({ id: 'user-1' })
    const res = await POST(buildRequest(null, true))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(CHUNK_API_ERROR.INVALID_BODY)
  })

  it('returns 400 when "text" field is missing', async () => {
    mockAuth({ id: 'user-1' })
    const res = await POST(buildRequest({ config: { size: 500 } }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(CHUNK_API_ERROR.MISSING_TEXT)
  })

  it('returns 400 when "text" field is an empty string', async () => {
    mockAuth({ id: 'user-1' })
    const res = await POST(buildRequest({ text: '' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(CHUNK_API_ERROR.MISSING_TEXT)
  })

  it('returns 400 when "text" is not a string', async () => {
    mockAuth({ id: 'user-1' })
    const res = await POST(buildRequest({ text: 42 }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(CHUNK_API_ERROR.MISSING_TEXT)
  })

  // ── Config validation ─────────────────────────────────────────────────────

  it('returns 400 when config.size is not a positive integer', async () => {
    mockAuth({ id: 'user-1' })
    const res = await POST(buildRequest({ text: 'hello', config: { size: 0 } }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(CHUNK_API_ERROR.INVALID_CONFIG)
  })

  it('returns 400 when config.overlap is negative', async () => {
    mockAuth({ id: 'user-1' })
    const res = await POST(
      buildRequest({ text: 'hello', config: { overlap: -1 } }),
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(CHUNK_API_ERROR.INVALID_CONFIG)
  })

  it('returns 400 when config.overlap >= config.size', async () => {
    mockAuth({ id: 'user-1' })
    const res = await POST(
      buildRequest({ text: 'hello', config: { size: 100, overlap: 100 } }),
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(CHUNK_API_ERROR.INVALID_CONFIG)
  })

  // ── Success ───────────────────────────────────────────────────────────────

  it('returns 200 with chunks using default config for short text', async () => {
    mockAuth({ id: 'user-1' })
    const res = await POST(buildRequest({ text: 'short text' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.chunks).toEqual(['short text'])
    expect(body.count).toBe(1)
  })

  it('returns 200 with custom config and correct chunk count', async () => {
    mockAuth({ id: 'user-1' })
    // 8 chars, size=4, overlap=1 → ['abcd', 'defg', 'gh']
    const res = await POST(
      buildRequest({
        text: 'abcdefgh',
        config: { size: 4, overlap: 1 },
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.chunks).toEqual(['abcd', 'defg', 'gh'])
    expect(body.count).toBe(3)
  })

  it('returns 200 with count equal to chunks.length', async () => {
    mockAuth({ id: 'user-1' })
    const text = 'x'.repeat(2500)
    const res = await POST(buildRequest({ text }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.count).toBe(body.chunks.length)
    expect(body.chunks.length).toBeGreaterThan(1)
  })

  it('returns 200 with empty chunks array for whitespace-only text with config', async () => {
    mockAuth({ id: 'user-1' })
    // The route validates text is non-empty string, but whitespace passes that.
    // chunkText trims and returns [] for blank text.
    const res = await POST(
      buildRequest({ text: '   ', config: { size: 10, overlap: 2 } }),
    )
    // text field passes isChunkRequest ('   ' is non-empty), so we get 200
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.chunks).toEqual([])
    expect(body.count).toBe(0)
  })
})
