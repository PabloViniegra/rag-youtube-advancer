/**
 * Unit tests for storeVideoSections (Phase 4 — Storage).
 *
 * The Supabase client is mocked with a fluent builder so we can control
 * the outcome of each DB call independently.
 *
 * We cover:
 *   - Successful full flow (upsert + delete + insert)
 *   - Empty sections array (skips insert step)
 *   - Error propagation from each DB step
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { EmbeddedChunk } from '@/lib/ai/types'
import { storeVideoSections } from './store'
import type { StoreVideoInput } from './types'

// ─── Mock builder helpers ──────────────────────────────────────────────────────

/**
 * Creates a minimal fluent Supabase mock that covers the chained API used by
 * `storeVideoSections`. Each call in the chain returns the next link.
 */
function createSupabaseMock(overrides: {
  upsertResult?: { data: unknown; error: unknown }
  deleteResult?: { error: unknown }
  insertResult?: { error: unknown }
}) {
  const upsertResult = overrides.upsertResult ?? {
    data: { id: 'video-uuid-1' },
    error: null,
  }
  const deleteResult = overrides.deleteResult ?? { error: null }
  const insertResult = overrides.insertResult ?? { error: null }

  // videos chain: .from('videos').upsert(...).select('id').single()
  const singleMock = vi.fn().mockResolvedValue(upsertResult)
  const selectMock = vi.fn().mockReturnValue({ single: singleMock })
  const upsertMock = vi.fn().mockReturnValue({ select: selectMock })

  // video_sections delete chain: .from('video_sections').delete().eq(...)
  const deleteEqMock = vi.fn().mockResolvedValue(deleteResult)
  const deleteMock = vi.fn().mockReturnValue({ eq: deleteEqMock })

  // video_sections insert chain: .from('video_sections').insert(...)
  const insertMock = vi.fn().mockResolvedValue(insertResult)

  const fromMock = vi.fn().mockImplementation((table: string) => {
    if (table === 'videos') {
      return { upsert: upsertMock }
    }
    // video_sections — return both delete and insert
    return { delete: deleteMock, insert: insertMock }
  })

  return {
    from: fromMock,
    _mocks: {
      upsertMock,
      singleMock,
      selectMock,
      deleteMock,
      deleteEqMock,
      insertMock,
    },
  }
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SECTION_A: EmbeddedChunk = {
  content: 'First segment text',
  index: 0,
  embedding: [0.1, 0.2, 0.3],
}

const SECTION_B: EmbeddedChunk = {
  content: 'Second segment text',
  index: 1,
  embedding: [0.4, 0.5, 0.6],
}

function buildInput(overrides?: Partial<StoreVideoInput>): StoreVideoInput {
  return {
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Rick Astley — Never Gonna Give You Up',
    userId: 'user-uuid-1',
    sections: [SECTION_A, SECTION_B],
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('storeVideoSections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Happy path ────────────────────────────────────────────────────────────

  it('returns videoId and count when all DB steps succeed', async () => {
    const supabase = createSupabaseMock({})
    const result = await storeVideoSections(
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      supabase as any,
      buildInput(),
    )

    expect(result).toEqual({ videoId: 'video-uuid-1', count: 2 })
  })

  it('calls upsert with correct video data', async () => {
    const supabase = createSupabaseMock({})
    const input = buildInput()

    // biome-ignore lint/suspicious/noExplicitAny: test mock
    await storeVideoSections(supabase as any, input)

    expect(supabase._mocks.upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        youtube_id: input.youtubeId,
        title: input.title,
        user_id: input.userId,
      }),
      expect.objectContaining({ onConflict: 'youtube_id,user_id' }),
    )
  })

  it('calls delete on video_sections with the resolved videoId', async () => {
    const supabase = createSupabaseMock({})
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    await storeVideoSections(supabase as any, buildInput())

    expect(supabase._mocks.deleteMock).toHaveBeenCalled()
    expect(supabase._mocks.deleteEqMock).toHaveBeenCalledWith(
      'video_id',
      'video-uuid-1',
    )
  })

  it('calls insert with correctly shaped rows', async () => {
    const supabase = createSupabaseMock({})
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    await storeVideoSections(supabase as any, buildInput())

    expect(supabase._mocks.insertMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          video_id: 'video-uuid-1',
          content: SECTION_A.content,
          embedding: SECTION_A.embedding,
        }),
        expect.objectContaining({
          video_id: 'video-uuid-1',
          content: SECTION_B.content,
          embedding: SECTION_B.embedding,
        }),
      ]),
    )
  })

  // ── Empty sections ────────────────────────────────────────────────────────

  it('skips insert and returns count 0 when sections array is empty', async () => {
    const supabase = createSupabaseMock({})
    const result = await storeVideoSections(
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      supabase as any,
      buildInput({ sections: [] }),
    )

    expect(result).toEqual({ videoId: 'video-uuid-1', count: 0 })
    expect(supabase._mocks.insertMock).not.toHaveBeenCalled()
  })

  // ── Error propagation ─────────────────────────────────────────────────────

  it('throws when upsert returns an error', async () => {
    const supabase = createSupabaseMock({
      upsertResult: { data: null, error: { message: 'upsert failed' } },
    })

    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      storeVideoSections(supabase as any, buildInput()),
    ).rejects.toThrow('Failed to upsert video: upsert failed')
  })

  it('throws when upsert returns no data', async () => {
    const supabase = createSupabaseMock({
      upsertResult: { data: null, error: null },
    })

    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      storeVideoSections(supabase as any, buildInput()),
    ).rejects.toThrow('Failed to upsert video: no data returned')
  })

  it('throws when delete returns an error', async () => {
    const supabase = createSupabaseMock({
      deleteResult: { error: { message: 'delete failed' } },
    })

    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      storeVideoSections(supabase as any, buildInput()),
    ).rejects.toThrow('Failed to delete existing sections: delete failed')
  })

  it('throws when insert returns an error', async () => {
    const supabase = createSupabaseMock({
      insertResult: { error: { message: 'insert failed' } },
    })

    await expect(
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      storeVideoSections(supabase as any, buildInput()),
    ).rejects.toThrow('Failed to insert video sections: insert failed')
  })
})
