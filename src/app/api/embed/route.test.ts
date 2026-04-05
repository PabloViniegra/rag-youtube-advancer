/**
 * Tests for POST /api/embed
 *
 * Auth and profile queries are mocked to control:
 *   - whether a user session exists (401 check)
 *   - whether the profile has subscription_active or admin role (403 check)
 *
 * The `embedChunks` implementation is tested in lib/ai/embed.test.ts;
 * here we focus on the HTTP layer: parsing, validation, auth, authz, and response shape.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('@/lib/ai/embed', () => ({
  embedChunks: vi.fn(),
}))

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { embedChunks } from '@/lib/ai/embed'
import type { EmbeddedChunk } from '@/lib/ai/types'
import { EMBED_API_ERROR } from '@/lib/ai/types'
import { POST } from './route'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildRequest(body: unknown, isInvalidJson = false): Request {
  if (isInvalidJson) {
    return new Request('http://localhost/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-valid-json{{{',
    })
  }
  return new Request('http://localhost/api/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

interface MockProfile {
  role: string
  subscription_active: boolean
}

function mockAuthAndProfile(
  user: { id: string } | null,
  profile: MockProfile | null = null,
  options: {
    videoCount?: number
  } = {},
) {
  const { videoCount = 0 } = options

  const maybeSingleMock = vi.fn().mockResolvedValue({
    data: profile,
    error: profile ? null : { message: 'not found' },
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
    if (table === 'profiles') {
      return { select: profileSelectMock }
    }

    if (table === 'videos') {
      return { select: videosSelectMock }
    }

    return { select: vi.fn() }
  })

  createClientMock.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: fromMock,
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('POST /api/embed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Authentication ─────────────────────────────────────────────────────────

  it('returns 401 when user is not authenticated', async () => {
    mockAuthAndProfile(null)
    const res = await POST(buildRequest({ chunks: ['hello'] }))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.code).toBe(EMBED_API_ERROR.UNAUTHORIZED)
  })

  // ── Authorization ──────────────────────────────────────────────────────────

  it('allows free users when under the video limit', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: false },
      { videoCount: 0 },
    )
    vi.mocked(embedChunks).mockResolvedValue([])
    const res = await POST(buildRequest({ chunks: ['hello'] }))
    expect(res.status).toBe(200)
  })

  it('returns 403 when free user reached the video limit', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: false },
      { videoCount: 1 },
    )
    const res = await POST(buildRequest({ chunks: ['hello'] }))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe(EMBED_API_ERROR.FORBIDDEN)
  })

  it('returns 403 when profile is not found and free limit is reached', async () => {
    mockAuthAndProfile({ id: 'user-1' }, null, { videoCount: 1 })
    const res = await POST(buildRequest({ chunks: ['hello'] }))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe(EMBED_API_ERROR.FORBIDDEN)
  })

  it('allows access when user has active subscription', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(embedChunks).mockResolvedValue([])
    const res = await POST(buildRequest({ chunks: ['hello'] }))
    expect(res.status).toBe(200)
  })

  it('allows access when user is admin regardless of subscription', async () => {
    mockAuthAndProfile(
      { id: 'admin-1' },
      { role: 'admin', subscription_active: false },
    )
    vi.mocked(embedChunks).mockResolvedValue([])
    const res = await POST(buildRequest({ chunks: ['hello'] }))
    expect(res.status).toBe(200)
  })

  // ── Body validation ───────────────────────────────────────────────────────

  it('returns 400 when body is not valid JSON', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(buildRequest(null, true))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(EMBED_API_ERROR.INVALID_BODY)
  })

  it('returns 400 when chunks field is missing', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(buildRequest({ text: 'hello' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(EMBED_API_ERROR.MISSING_CHUNKS)
  })

  it('returns 400 when chunks is an empty array', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(buildRequest({ chunks: [] }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(EMBED_API_ERROR.MISSING_CHUNKS)
  })

  it('returns 400 when chunks contains non-string values', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(buildRequest({ chunks: [42, 'hello'] }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(EMBED_API_ERROR.MISSING_CHUNKS)
  })

  it('returns 400 when chunks contains empty strings', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(buildRequest({ chunks: ['valid', ''] }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(EMBED_API_ERROR.MISSING_CHUNKS)
  })

  // ── Success ───────────────────────────────────────────────────────────────

  it('returns 200 with embedded chunks and correct count', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )

    const mockEmbedded: EmbeddedChunk[] = [
      { content: 'first chunk', index: 0, embedding: [0.1, 0.2, 0.3] },
      { content: 'second chunk', index: 1, embedding: [0.4, 0.5, 0.6] },
    ]
    vi.mocked(embedChunks).mockResolvedValue(mockEmbedded)

    const res = await POST(
      buildRequest({ chunks: ['first chunk', 'second chunk'] }),
    )
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.data).toEqual(mockEmbedded)
    expect(body.count).toBe(2)
  })

  it('calls embedChunks with the provided chunks', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(embedChunks).mockResolvedValue([])

    await POST(buildRequest({ chunks: ['segment one', 'segment two'] }))

    expect(embedChunks).toHaveBeenCalledWith(['segment one', 'segment two'])
  })

  // ── Error handling ────────────────────────────────────────────────────────

  it('returns 500 when embedChunks throws a non-provider error', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    // Throw a non-object value so resolveProviderFailure returns null
    // and the catch-all 500 branch is reached.
    vi.mocked(embedChunks).mockRejectedValue('unexpected string error')

    const res = await POST(buildRequest({ chunks: ['some chunk'] }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.code).toBe(EMBED_API_ERROR.INTERNAL_ERROR)
  })
})
