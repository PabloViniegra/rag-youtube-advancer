/**
 * Unit tests for retrieveSections (Phase 5 — Retrieval).
 *
 * Both the Supabase client's `rpc` method and `generateEmbedding` are mocked
 * so no network calls are made.
 *
 * We cover:
 *   - Successful full flow (embed → RPC → mapped results)
 *   - Empty results array from RPC
 *   - Error propagation from generateEmbedding
 *   - Error propagation from RPC
 *   - Correct mapping of snake_case rows to camelCase domain objects
 *   - Correct parameters forwarded to RPC and generateEmbedding
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { retrieveSections } from './retrieve'
import type { RetrievalInput } from './types'

// ─── Mock generateEmbedding ───────────────────────────────────────────────────

vi.mock('@/lib/ai/embed', () => ({
  generateEmbedding: vi.fn(),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

import { generateEmbedding } from '@/lib/ai/embed'

const mockGenerateEmbedding = vi.mocked(generateEmbedding)

const QUERY_VECTOR = Array.from({ length: 1536 }, (_, i) => i * 0.001)

/** Creates a minimal Supabase mock covering the `.rpc(...)` call. */
function createSupabaseMock(rpcResult: { data: unknown; error: unknown }) {
  const rpcMock = vi.fn().mockResolvedValue(rpcResult)
  return {
    rpc: rpcMock,
    _mocks: { rpcMock },
  }
}

/** Sample RPC rows returned from match_video_sections. */
const MATCH_ROWS = [
  {
    id: 'sec-1',
    video_id: 'vid-1',
    content: 'First match content',
    similarity: 0.92,
  },
  {
    id: 'sec-2',
    video_id: 'vid-2',
    content: 'Second match content',
    similarity: 0.85,
  },
]

function buildInput(overrides?: Partial<RetrievalInput>): RetrievalInput {
  return {
    query: 'What is machine learning?',
    userId: 'user-uuid-1',
    matchThreshold: 0.7,
    matchCount: 5,
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('retrieveSections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGenerateEmbedding.mockResolvedValue(QUERY_VECTOR)
  })

  // ── Happy path ────────────────────────────────────────────────────────────

  it('returns matches and count when RPC succeeds', async () => {
    const supabase = createSupabaseMock({ data: MATCH_ROWS, error: null })

    // biome-ignore lint/suspicious/noExplicitAny: test mock
    const result = await retrieveSections(supabase as any, buildInput())

    expect(result.count).toBe(2)
    expect(result.matches).toHaveLength(2)
  })

  it('maps snake_case DB rows to camelCase domain objects', async () => {
    const supabase = createSupabaseMock({ data: MATCH_ROWS, error: null })

    // biome-ignore lint/suspicious/noExplicitAny: test mock
    const result = await retrieveSections(supabase as any, buildInput())

    expect(result.matches[0]).toEqual({
      id: 'sec-1',
      videoId: 'vid-1',
      content: 'First match content',
      similarity: 0.92,
    })
    expect(result.matches[1]).toEqual({
      id: 'sec-2',
      videoId: 'vid-2',
      content: 'Second match content',
      similarity: 0.85,
    })
  })

  it('calls generateEmbedding with the query text', async () => {
    const supabase = createSupabaseMock({ data: MATCH_ROWS, error: null })
    const input = buildInput()

    // biome-ignore lint/suspicious/noExplicitAny: test mock
    await retrieveSections(supabase as any, input)

    expect(mockGenerateEmbedding).toHaveBeenCalledOnce()
    expect(mockGenerateEmbedding).toHaveBeenCalledWith(input.query)
  })

  it('forwards correct args to the match_video_sections RPC', async () => {
    const supabase = createSupabaseMock({ data: MATCH_ROWS, error: null })
    const input = buildInput({ matchThreshold: 0.8, matchCount: 3 })

    // biome-ignore lint/suspicious/noExplicitAny: test mock
    await retrieveSections(supabase as any, input)

    expect(supabase._mocks.rpcMock).toHaveBeenCalledWith(
      'match_video_sections',
      expect.objectContaining({
        query_embedding: QUERY_VECTOR,
        user_id: input.userId,
        match_threshold: 0.8,
        match_count: 3,
      }),
    )
  })

  // ── Empty results ─────────────────────────────────────────────────────────

  it('returns empty matches and count 0 when RPC returns no rows', async () => {
    const supabase = createSupabaseMock({ data: [], error: null })

    // biome-ignore lint/suspicious/noExplicitAny: test mock
    const result = await retrieveSections(supabase as any, buildInput())

    expect(result).toEqual({ matches: [], count: 0 })
  })

  it('handles null data from RPC gracefully (treats as empty)', async () => {
    const supabase = createSupabaseMock({ data: null, error: null })

    // biome-ignore lint/suspicious/noExplicitAny: test mock
    const result = await retrieveSections(supabase as any, buildInput())

    expect(result).toEqual({ matches: [], count: 0 })
  })

  // ── Error propagation ─────────────────────────────────────────────────────

  it('throws when generateEmbedding fails', async () => {
    mockGenerateEmbedding.mockRejectedValue(new Error('gateway timeout'))
    const supabase = createSupabaseMock({ data: null, error: null })

    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      retrieveSections(supabase as any, buildInput()),
    ).rejects.toThrow('gateway timeout')
  })

  it('throws when RPC returns an error', async () => {
    const supabase = createSupabaseMock({
      data: null,
      error: { message: 'rpc call failed' },
    })

    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      retrieveSections(supabase as any, buildInput()),
    ).rejects.toThrow('match_video_sections RPC failed: rpc call failed')
  })
})
