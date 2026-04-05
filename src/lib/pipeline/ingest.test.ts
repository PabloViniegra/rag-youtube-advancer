/**
 * Tests for ingestVideo — Pipeline orchestrator (Server Action)
 *
 * `fetch` is mocked globally so we can control the response of each phase
 * without hitting real API routes. `next/headers` is mocked to return a
 * predictable host + cookie header.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { INGEST_ERROR } from './types'

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { headers } from 'next/headers'
import { ingestVideo } from './ingest'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const VALID_INPUT = {
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  title: 'Test Video',
}

const TRANSCRIPT_OK = {
  videoId: 'dQw4w9WgXcQ',
  fullText: 'This is the transcript text.',
}

const CHUNK_OK = {
  chunks: ['chunk one', 'chunk two'],
}

const EMBED_OK = {
  data: [
    { content: 'chunk one', index: 0, embedding: [0.1, 0.2] },
    { content: 'chunk two', index: 1, embedding: [0.3, 0.4] },
  ],
}

const STORE_OK = {
  videoId: 'vid-uuid-123',
  count: 2,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockHeaders(host = 'localhost:3000', cookie = 'sb-cookie=abc') {
  vi.mocked(headers).mockResolvedValue({
    get: (key: string) => {
      if (key === 'host') return host
      if (key === 'cookie') return cookie
      return null
    },
  } as unknown as Awaited<ReturnType<typeof headers>>)
}

function mockIngestionGate(
  user: { id: string } | null = { id: 'user-1' },
  profile: { role: string; subscription_active: boolean } | null = {
    role: 'user',
    subscription_active: false,
  },
  videoCount = 0,
) {
  const maybeSingleMock = vi.fn().mockResolvedValue({
    data: profile,
    error: null,
  })
  const profileEqMock = vi
    .fn()
    .mockReturnValue({ maybeSingle: maybeSingleMock })
  const profileSelectMock = vi.fn().mockReturnValue({ eq: profileEqMock })

  const videosEqMock = vi.fn().mockResolvedValue({
    count: videoCount,
    error: null,
  })
  const videosSelectMock = vi.fn().mockReturnValue({ eq: videosEqMock })

  const fromMock = vi.fn((table: string) => {
    if (table === 'profiles') return { select: profileSelectMock }
    if (table === 'videos') return { select: videosSelectMock }
    return { select: vi.fn() }
  })

  createClientMock.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: fromMock,
  })
}

/**
 * Build a `fetch` spy that returns the given responses in order (one per call).
 */
function mockFetchSequence(
  responses: Array<{ status: number; body: unknown }>,
) {
  let call = 0
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
    const r = responses[call++]
    const body = JSON.stringify(r?.body ?? null)
    return new Response(body, {
      status: r?.status ?? 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ingestVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHeaders()
    mockIngestionGate()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── Happy path ──────────────────────────────────────────────────────────────

  it('returns success when all 4 phases succeed', async () => {
    mockFetchSequence([
      { status: 200, body: TRANSCRIPT_OK },
      { status: 200, body: CHUNK_OK },
      { status: 200, body: EMBED_OK },
      { status: 200, body: STORE_OK },
    ])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.videoId).toBe('vid-uuid-123')
    expect(result.sectionCount).toBe(2)
  })

  it('calls all 4 API routes in order', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input) => {
        const url = input.toString()
        if (url.includes('/api/transcript'))
          return new Response(JSON.stringify(TRANSCRIPT_OK), { status: 200 })
        if (url.includes('/api/chunk'))
          return new Response(JSON.stringify(CHUNK_OK), { status: 200 })
        if (url.includes('/api/embed'))
          return new Response(JSON.stringify(EMBED_OK), { status: 200 })
        if (url.includes('/api/store'))
          return new Response(JSON.stringify(STORE_OK), { status: 200 })
        return new Response('not found', { status: 404 })
      })

    await ingestVideo(VALID_INPUT)

    const urls = fetchSpy.mock.calls.map((c) => c[0]?.toString() ?? '')
    expect(urls.some((u) => u.includes('/api/transcript'))).toBe(true)
    expect(urls.some((u) => u.includes('/api/chunk'))).toBe(true)
    expect(urls.some((u) => u.includes('/api/embed'))).toBe(true)
    expect(urls.some((u) => u.includes('/api/store'))).toBe(true)
  })

  it('uses https protocol when host is not localhost', async () => {
    mockHeaders('myapp.vercel.app', '')
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input) => {
        const url = input.toString()
        if (url.startsWith('https://myapp.vercel.app')) {
          if (url.includes('/api/transcript'))
            return new Response(JSON.stringify(TRANSCRIPT_OK), { status: 200 })
          if (url.includes('/api/chunk'))
            return new Response(JSON.stringify(CHUNK_OK), { status: 200 })
          if (url.includes('/api/embed'))
            return new Response(JSON.stringify(EMBED_OK), { status: 200 })
          if (url.includes('/api/store'))
            return new Response(JSON.stringify(STORE_OK), { status: 200 })
        }
        return new Response('bad', { status: 500 })
      })

    const result = await ingestVideo(VALID_INPUT)
    expect(result.ok).toBe(true)

    const firstUrl = fetchSpy.mock.calls[0]?.[0]?.toString() ?? ''
    expect(firstUrl.startsWith('https://')).toBe(true)
  })

  // ── Phase 1 — Transcript errors ─────────────────────────────────────────────

  it('returns TRANSCRIPT_FAILED on transcript 500', async () => {
    mockFetchSequence([{ status: 500, body: { error: 'server exploded' } }])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.TRANSCRIPT_FAILED)
    expect(result.message).toBe('server exploded')
  })

  it('returns UNAUTHORIZED on transcript 401', async () => {
    mockFetchSequence([{ status: 401, body: { error: 'not auth' } }])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.UNAUTHORIZED)
  })

  it('returns FORBIDDEN on transcript 403', async () => {
    mockFetchSequence([{ status: 403, body: {} }])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.FORBIDDEN)
  })

  it('returns TRANSCRIPT_FAILED with generic message when body has no error field', async () => {
    mockFetchSequence([{ status: 500, body: null }])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.TRANSCRIPT_FAILED)
    expect(result.message).toBe('Transcript extraction failed.')
  })

  it('returns TRANSCRIPT_FAILED when transcript response has invalid shape', async () => {
    mockFetchSequence([
      { status: 200, body: { videoId: 'ok', missing_fullText: true } },
    ])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.TRANSCRIPT_FAILED)
    expect(result.message).toBe('Invalid transcript response.')
  })

  it('uses message field from error body as fallback', async () => {
    mockFetchSequence([{ status: 502, body: { message: 'gateway timeout' } }])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.message).toBe('gateway timeout')
  })

  // ── Phase 2 — Chunk errors ───────────────────────────────────────────────────

  it('returns CHUNK_FAILED on chunk 500', async () => {
    mockFetchSequence([
      { status: 200, body: TRANSCRIPT_OK },
      { status: 500, body: { error: 'chunk error' } },
    ])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.CHUNK_FAILED)
    expect(result.message).toBe('chunk error')
  })

  it('returns CHUNK_FAILED when chunk response has invalid shape', async () => {
    mockFetchSequence([
      { status: 200, body: TRANSCRIPT_OK },
      { status: 200, body: { notChunks: true } },
    ])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.CHUNK_FAILED)
    expect(result.message).toBe('Invalid chunk response.')
  })

  it('returns UNAUTHORIZED on chunk 401', async () => {
    mockFetchSequence([
      { status: 200, body: TRANSCRIPT_OK },
      { status: 401, body: {} },
    ])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.UNAUTHORIZED)
  })

  // ── Phase 3 — Embed errors ───────────────────────────────────────────────────

  it('returns EMBED_FAILED on embed 500', async () => {
    mockFetchSequence([
      { status: 200, body: TRANSCRIPT_OK },
      { status: 200, body: CHUNK_OK },
      { status: 500, body: { error: 'embed error' } },
    ])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.EMBED_FAILED)
    expect(result.message).toBe('embed error')
  })

  it('returns EMBED_FAILED when embed response has invalid shape', async () => {
    mockFetchSequence([
      { status: 200, body: TRANSCRIPT_OK },
      { status: 200, body: CHUNK_OK },
      { status: 200, body: { data: [{ bad: 'shape' }] } },
    ])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.EMBED_FAILED)
    expect(result.message).toBe('Invalid embed response.')
  })

  it('returns FORBIDDEN on embed 403', async () => {
    mockFetchSequence([
      { status: 200, body: TRANSCRIPT_OK },
      { status: 200, body: CHUNK_OK },
      { status: 403, body: {} },
    ])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.FORBIDDEN)
  })

  // ── Phase 4 — Store errors ───────────────────────────────────────────────────

  it('returns STORE_FAILED on store 500', async () => {
    mockFetchSequence([
      { status: 200, body: TRANSCRIPT_OK },
      { status: 200, body: CHUNK_OK },
      { status: 200, body: EMBED_OK },
      { status: 500, body: { error: 'db write failed' } },
    ])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.STORE_FAILED)
    expect(result.message).toBe('db write failed')
  })

  it('returns STORE_FAILED when store response has invalid shape', async () => {
    mockFetchSequence([
      { status: 200, body: TRANSCRIPT_OK },
      { status: 200, body: CHUNK_OK },
      { status: 200, body: EMBED_OK },
      { status: 200, body: { videoId: 'ok' } }, // missing count
    ])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.STORE_FAILED)
    expect(result.message).toBe('Invalid store response.')
  })

  it('returns UNAUTHORIZED on store 401', async () => {
    mockFetchSequence([
      { status: 200, body: TRANSCRIPT_OK },
      { status: 200, body: CHUNK_OK },
      { status: 200, body: EMBED_OK },
      { status: 401, body: {} },
    ])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.UNAUTHORIZED)
  })

  it('returns generic STORE_FAILED message when store body has no error field', async () => {
    mockFetchSequence([
      { status: 200, body: TRANSCRIPT_OK },
      { status: 200, body: CHUNK_OK },
      { status: 200, body: EMBED_OK },
      { status: 500, body: {} },
    ])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.STORE_FAILED)
    expect(result.message).toBe('Storing video sections failed.')
  })
})
