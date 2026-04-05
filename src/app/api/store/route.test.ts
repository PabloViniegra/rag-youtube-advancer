/**
 * Tests for POST /api/store
 *
 * Auth and profile queries are mocked identically to /api/embed tests.
 * `storeVideoSections` is mocked at the lib level so we focus exclusively
 * on the HTTP layer: parsing, validation, auth, authz, and response shape.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('@/lib/storage/store', () => ({
  storeVideoSections: vi.fn(),
}))

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import type { EmbeddedChunk } from '@/lib/ai/types'
import { storeVideoSections } from '@/lib/storage/store'
import { STORE_API_ERROR } from '@/lib/storage/types'
import { POST } from './route'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_SECTION: EmbeddedChunk = {
  content: 'Hello world',
  index: 0,
  embedding: [0.1, 0.2, 0.3],
}

const VALID_BODY = {
  youtubeId: 'dQw4w9WgXcQ',
  title: 'Test Video',
  sections: [VALID_SECTION],
}

function buildRequest(body: unknown, isInvalidJson = false): Request {
  if (isInvalidJson) {
    return new Request('http://localhost/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-valid-json{{{',
    })
  }
  return new Request('http://localhost/api/store', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

interface MockProfile {
  role: string
  subscription_active: boolean
  trial_used?: boolean
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

  // update chain: .from('profiles').update({}).eq()  — fire-and-forget in route
  const profileUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
  const profileUpdateMock = vi.fn().mockReturnValue({ eq: profileUpdateEqMock })

  const videosEqMock = vi.fn().mockResolvedValue({
    count: videoCount,
    error: null,
  })
  const videosSelectMock = vi.fn().mockReturnValue({ eq: videosEqMock })

  const fromMock = vi.fn((table: string) => {
    if (table === 'profiles') {
      return { select: profileSelectMock, update: profileUpdateMock }
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

describe('POST /api/store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Authentication ─────────────────────────────────────────────────────────

  it('returns 401 when user is not authenticated', async () => {
    mockAuthAndProfile(null)
    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.code).toBe(STORE_API_ERROR.UNAUTHORIZED)
  })

  // ── Authorization ──────────────────────────────────────────────────────────

  it('allows free users when trial has not been used', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: false, trial_used: false },
    )
    vi.mocked(storeVideoSections).mockResolvedValue({
      videoId: 'vid-1',
      count: 1,
    })
    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(200)
  })

  it('returns 403 when free user trial has been used', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: false, trial_used: true },
    )
    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe(STORE_API_ERROR.FORBIDDEN)
  })

  it('allows free users when profile is not found (trial defaults to false)', async () => {
    mockAuthAndProfile({ id: 'user-1' }, null)
    vi.mocked(storeVideoSections).mockResolvedValue({
      videoId: 'vid-1',
      count: 1,
    })
    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(200)
  })

  it('allows access when user has active subscription', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(storeVideoSections).mockResolvedValue({
      videoId: 'vid-1',
      count: 1,
    })
    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(200)
  })

  it('allows access when user is admin regardless of subscription', async () => {
    mockAuthAndProfile(
      { id: 'admin-1' },
      { role: 'admin', subscription_active: false },
    )
    vi.mocked(storeVideoSections).mockResolvedValue({
      videoId: 'vid-1',
      count: 1,
    })
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
    expect(body.code).toBe(STORE_API_ERROR.INVALID_BODY)
  })

  it('returns 400 when youtubeId is missing', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(
      buildRequest({ title: 'Test', sections: [VALID_SECTION] }),
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(STORE_API_ERROR.INVALID_BODY)
  })

  it('returns 400 when title is missing', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(
      buildRequest({ youtubeId: 'abc', sections: [VALID_SECTION] }),
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(STORE_API_ERROR.INVALID_BODY)
  })

  it('returns 400 when sections contains invalid chunks', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    const res = await POST(
      buildRequest({
        youtubeId: 'abc',
        title: 'Test',
        sections: [{ content: '', index: 0, embedding: [0.1] }],
      }),
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe(STORE_API_ERROR.INVALID_BODY)
  })

  it('accepts empty sections array as valid', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(storeVideoSections).mockResolvedValue({
      videoId: 'vid-1',
      count: 0,
    })
    const res = await POST(
      buildRequest({ youtubeId: 'abc', title: 'Test', sections: [] }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.count).toBe(0)
  })

  // ── Success ───────────────────────────────────────────────────────────────

  it('returns 200 with videoId and count on success', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(storeVideoSections).mockResolvedValue({
      videoId: 'vid-uuid-1',
      count: 1,
    })

    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.videoId).toBe('vid-uuid-1')
    expect(body.count).toBe(1)
  })

  it('calls storeVideoSections with correct input', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(storeVideoSections).mockResolvedValue({
      videoId: 'vid-1',
      count: 1,
    })

    await POST(buildRequest(VALID_BODY))

    expect(storeVideoSections).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        youtubeId: VALID_BODY.youtubeId,
        title: VALID_BODY.title,
        userId: 'user-1',
        sections: VALID_BODY.sections,
      }),
    )
  })

  // ── Error handling ────────────────────────────────────────────────────────

  it('returns 500 when storeVideoSections throws', async () => {
    mockAuthAndProfile(
      { id: 'user-1' },
      { role: 'user', subscription_active: true },
    )
    vi.mocked(storeVideoSections).mockRejectedValue(new Error('db error'))

    const res = await POST(buildRequest(VALID_BODY))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.code).toBe(STORE_API_ERROR.INTERNAL_ERROR)
  })
})
