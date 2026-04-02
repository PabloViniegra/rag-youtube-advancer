/**
 * Tests for POST /api/retrieve
 *
 * Auth and profile queries are mocked identically to /api/store and /api/embed.
 * `retrieveSections` is mocked at the lib level so we focus exclusively
 * on the HTTP layer: parsing, validation, auth, authz, and response shape.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('@/lib/retrieval/retrieve', () => ({
  retrieveSections: vi.fn(),
}))

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { retrieveSections } from '@/lib/retrieval/retrieve'
import { RETRIEVE_API_ERROR, RETRIEVE_DEFAULTS } from '@/lib/retrieval/types'
import { POST } from './route'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_BODY = {
  query: 'What is machine learning?',
}

const VALID_BODY_WITH_OVERRIDES = {
  query: 'What is machine learning?',
  matchThreshold: 0.8,
  matchCount: 3,
}

const MATCH_RESULT = {
  matches: [
    {
      id: 'sec-1',
      videoId: 'vid-1',
      content: 'Some content',
      similarity: 0.91,
    },
  ],
  count: 1,
}

function buildRequest(body: unknown, isInvalidJson = false): Request {
  if (isInvalidJson) {
    return new Request('http://localhost/api/retrieve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-valid-json{{{',
    })
  }
  return new Request('http://localhost/api/retrieve', {
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
) {
  const singleMock = vi.fn().mockResolvedValue({
    data: profile,
    error: profile ? null : { message: 'not found' },
  })
  const eqMock = vi.fn().mockReturnValue({ single: singleMock })
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
  const fromMock = vi.fn().mockReturnValue({ select: selectMock })

  createClientMock.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: fromMock,
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('POST /api/retrieve', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Authentication ─────────────────────────────────────────────────────────

  it('returns 401 when user is not authenticated', async () => {
    mockAuthAndProfile(null)
    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.code).toBe(RETRIEVE_API_ERROR.UNAUTHORIZED)
  })

  // ── Authorization ──────────────────────────────────────────────────────────

  it('returns 403 when user has no subscription and is not admin', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: false },
    )
    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe(RETRIEVE_API_ERROR.FORBIDDEN)
  })

  it('returns 403 when profile is not found', async () => {
    mockAuthAndProfile({ id: 'user-1' }, null)
    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe(RETRIEVE_API_ERROR.FORBIDDEN)
  })

  it('allows access when user has active subscription', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(retrieveSections).mockResolvedValue(MATCH_RESULT)
    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(200)
  })

  it('allows access when user is admin regardless of subscription', async () => {
    mockAuthAndProfile(
      { id: 'admin-1' },
      { role: 'admin', subscription_active: false },
    )
    vi.mocked(retrieveSections).mockResolvedValue(MATCH_RESULT)
    const res = await POST(buildRequest(VALID_BODY))
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
    expect(body.code).toBe(RETRIEVE_API_ERROR.INVALID_BODY)
  })

  it('returns 400 when query is missing', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(buildRequest({ matchThreshold: 0.7 }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(RETRIEVE_API_ERROR.INVALID_BODY)
  })

  it('returns 400 when query is empty string', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(buildRequest({ query: '   ' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(RETRIEVE_API_ERROR.INVALID_BODY)
  })

  it('returns 400 when matchThreshold is out of range', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(buildRequest({ query: 'test', matchThreshold: 1.5 }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(RETRIEVE_API_ERROR.INVALID_BODY)
  })

  it('returns 400 when matchCount is not a positive integer', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(buildRequest({ query: 'test', matchCount: 0 }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(RETRIEVE_API_ERROR.INVALID_BODY)
  })

  // ── Success ───────────────────────────────────────────────────────────────

  it('returns 200 with matches and count on success', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(retrieveSections).mockResolvedValue(MATCH_RESULT)

    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.matches).toHaveLength(1)
    expect(body.count).toBe(1)
  })

  it('applies defaults for matchThreshold and matchCount when omitted', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(retrieveSections).mockResolvedValue(MATCH_RESULT)

    await POST(buildRequest(VALID_BODY))

    expect(retrieveSections).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        query: VALID_BODY.query,
        userId: 'user-1',
        matchThreshold: RETRIEVE_DEFAULTS.matchThreshold,
        matchCount: RETRIEVE_DEFAULTS.matchCount,
      }),
    )
  })

  it('forwards explicit matchThreshold and matchCount to retrieveSections', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(retrieveSections).mockResolvedValue(MATCH_RESULT)

    await POST(buildRequest(VALID_BODY_WITH_OVERRIDES))

    expect(retrieveSections).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        matchThreshold: 0.8,
        matchCount: 3,
      }),
    )
  })

  // ── Error handling ────────────────────────────────────────────────────────

  it('returns 500 when retrieveSections throws', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(retrieveSections).mockRejectedValue(new Error('rpc error'))

    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.code).toBe(RETRIEVE_API_ERROR.INTERNAL_ERROR)
  })
})
