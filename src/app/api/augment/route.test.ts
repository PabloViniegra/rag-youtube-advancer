/**
 * Tests for POST /api/augment
 *
 * Auth/profile queries are mocked identically to /api/retrieve.
 * Both `retrieveSections` and `augmentAnswer` are mocked so we focus
 * exclusively on the HTTP layer: parsing, validation, auth, authz, 404 on
 * no-context, and the success/error response shapes.
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

vi.mock('@/lib/augmentation/augment', () => ({
  augmentAnswer: vi.fn(),
}))

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { augmentAnswer } from '@/lib/augmentation/augment'
import { AUGMENT_API_ERROR, AUGMENT_DEFAULTS } from '@/lib/augmentation/types'
import { retrieveSections } from '@/lib/retrieval/retrieve'
import { POST } from './route'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const VALID_BODY = { query: 'What are React hooks?' }

const VALID_BODY_WITH_OVERRIDES = {
  query: 'What are React hooks?',
  matchThreshold: 0.8,
  matchCount: 3,
}

const MATCHES = [
  {
    id: 'sec-1',
    videoId: 'vid-1',
    content: 'React hooks simplify state management.',
    similarity: 0.93,
  },
]

const RETRIEVAL_RESULT = { matches: MATCHES, count: 1 }

const AUGMENT_RESULT = {
  answer: 'React hooks are special functions.',
  sources: MATCHES,
  sourceCount: 1,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildRequest(body: unknown, isInvalidJson = false): Request {
  if (isInvalidJson) {
    return new Request('http://localhost/api/augment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-valid-json{{{',
    })
  }
  return new Request('http://localhost/api/augment', {
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

describe('POST /api/augment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Authentication ──────────────────────────────────────────────────────────

  it('returns 401 when user is not authenticated', async () => {
    mockAuthAndProfile(null)
    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.code).toBe(AUGMENT_API_ERROR.UNAUTHORIZED)
  })

  // ── Authorization ───────────────────────────────────────────────────────────

  it('returns 403 when user has no subscription and is not admin', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: false },
    )
    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe(AUGMENT_API_ERROR.FORBIDDEN)
  })

  it('returns 403 when profile is not found', async () => {
    mockAuthAndProfile({ id: 'user-1' }, null)
    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe(AUGMENT_API_ERROR.FORBIDDEN)
  })

  it('allows access when user has an active subscription', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(retrieveSections).mockResolvedValue(RETRIEVAL_RESULT)
    vi.mocked(augmentAnswer).mockResolvedValue(AUGMENT_RESULT)
    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(200)
  })

  it('allows access when user is admin regardless of subscription', async () => {
    mockAuthAndProfile(
      { id: 'admin-1' },
      { role: 'admin', subscription_active: false },
    )
    vi.mocked(retrieveSections).mockResolvedValue(RETRIEVAL_RESULT)
    vi.mocked(augmentAnswer).mockResolvedValue(AUGMENT_RESULT)
    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(200)
  })

  // ── Body validation ─────────────────────────────────────────────────────────

  it('returns 400 when body is not valid JSON', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(buildRequest(null, true))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(AUGMENT_API_ERROR.INVALID_BODY)
  })

  it('returns 400 when query is missing', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(buildRequest({ matchThreshold: 0.7 }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(AUGMENT_API_ERROR.INVALID_BODY)
  })

  it('returns 400 when query is an empty string', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(buildRequest({ query: '   ' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(AUGMENT_API_ERROR.INVALID_BODY)
  })

  it('returns 400 when matchThreshold is out of [0,1] range', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(buildRequest({ query: 'test', matchThreshold: 1.5 }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(AUGMENT_API_ERROR.INVALID_BODY)
  })

  it('returns 400 when matchCount is not a positive integer', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(buildRequest({ query: 'test', matchCount: 0 }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(AUGMENT_API_ERROR.INVALID_BODY)
  })

  // ── No context ──────────────────────────────────────────────────────────────

  it('returns 404 when no matching sections are found', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(retrieveSections).mockResolvedValue({ matches: [], count: 0 })
    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.code).toBe(AUGMENT_API_ERROR.NO_CONTEXT)
  })

  // ── Success ─────────────────────────────────────────────────────────────────

  it('returns 200 with answer, sources and sourceCount on success', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(retrieveSections).mockResolvedValue(RETRIEVAL_RESULT)
    vi.mocked(augmentAnswer).mockResolvedValue(AUGMENT_RESULT)

    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.answer).toBe('React hooks are special functions.')
    expect(body.sources).toHaveLength(1)
    expect(body.sourceCount).toBe(1)
  })

  it('applies AUGMENT_DEFAULTS when matchThreshold and matchCount are omitted', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(retrieveSections).mockResolvedValue(RETRIEVAL_RESULT)
    vi.mocked(augmentAnswer).mockResolvedValue(AUGMENT_RESULT)

    await POST(buildRequest(VALID_BODY))

    expect(retrieveSections).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        query: VALID_BODY.query,
        userId: 'user-1',
        matchThreshold: AUGMENT_DEFAULTS.matchThreshold,
        matchCount: AUGMENT_DEFAULTS.matchCount,
      }),
    )
  })

  it('forwards explicit matchThreshold and matchCount to retrieveSections', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(retrieveSections).mockResolvedValue(RETRIEVAL_RESULT)
    vi.mocked(augmentAnswer).mockResolvedValue(AUGMENT_RESULT)

    await POST(buildRequest(VALID_BODY_WITH_OVERRIDES))

    expect(retrieveSections).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        matchThreshold: 0.8,
        matchCount: 3,
      }),
    )
  })

  it('passes the retrieved matches to augmentAnswer', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(retrieveSections).mockResolvedValue(RETRIEVAL_RESULT)
    vi.mocked(augmentAnswer).mockResolvedValue(AUGMENT_RESULT)

    await POST(buildRequest(VALID_BODY))

    expect(augmentAnswer).toHaveBeenCalledWith({
      query: VALID_BODY.query,
      matches: MATCHES,
    })
  })

  // ── Error handling ──────────────────────────────────────────────────────────

  it('returns 500 when retrieveSections throws', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(retrieveSections).mockRejectedValue(new Error('rpc error'))

    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.code).toBe(AUGMENT_API_ERROR.INTERNAL_ERROR)
  })

  it('returns 500 when augmentAnswer throws', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(retrieveSections).mockResolvedValue(RETRIEVAL_RESULT)
    vi.mocked(augmentAnswer).mockRejectedValue(new Error('LLM timeout'))

    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.code).toBe(AUGMENT_API_ERROR.INTERNAL_ERROR)
  })
})
