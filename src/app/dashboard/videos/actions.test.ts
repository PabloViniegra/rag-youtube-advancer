/**
 * Tests for deleteVideo Server Action.
 *
 * Mocks getCurrentUser and the Supabase client to verify:
 * - Auth guard (unauthenticated user)
 * - Ownership check (video not found or belongs to another user)
 * - Successful deletion + revalidatePath
 * - DB error handling
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const {
  getCurrentUserMock,
  createClientMock,
  revalidatePathMock,
  updateTagMock,
} = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  createClientMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  updateTagMock: vi.fn(),
}))

vi.mock('@/lib/auth/actions', () => ({
  getCurrentUser: getCurrentUserMock,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
  updateTag: updateTagMock,
}))

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { deleteVideo, getVideoSectionStats } from './actions'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockSupabase({
  videoRow = { id: 'video-1' } as { id: string } | null,
  fetchError = null as { message: string } | null,
  deleteError = null as { message: string } | null,
} = {}) {
  // ownership fetch: .from('videos').select('id').eq().eq().maybeSingle()
  const maybeSingleMock = vi.fn().mockResolvedValue({
    data: videoRow,
    error: fetchError,
  })
  const fetchEq2Mock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
  const fetchEq1Mock = vi.fn().mockReturnValue({ eq: fetchEq2Mock })
  const fetchSelectMock = vi.fn().mockReturnValue({ eq: fetchEq1Mock })

  // delete: .from('videos').delete().eq().eq()
  const deleteEq2Mock = vi.fn().mockResolvedValue({ error: deleteError })
  const deleteEq1Mock = vi.fn().mockReturnValue({ eq: deleteEq2Mock })
  const deleteMock = vi.fn().mockReturnValue({ eq: deleteEq1Mock })

  createClientMock.mockResolvedValue({
    from: vi.fn(() => ({
      select: fetchSelectMock,
      delete: deleteMock,
    })),
  })
}

function mockSupabaseForStats({
  videoRow = { id: 'video-1' } as { id: string } | null,
  videoFetchError = null as { message: string } | null,
  sectionsData = [{ content: 'hello world' }, { content: 'foo bar baz' }] as
    | { content: string | null }[]
    | null,
  sectionsError = null as { message: string } | null,
} = {}) {
  // ownership fetch: .from('videos').select('id').eq().eq().maybeSingle()
  const maybeSingleMock = vi.fn().mockResolvedValue({
    data: videoRow,
    error: videoFetchError,
  })
  const videoEq2Mock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
  const videoEq1Mock = vi.fn().mockReturnValue({ eq: videoEq2Mock })
  const videoSelectMock = vi.fn().mockReturnValue({ eq: videoEq1Mock })

  // sections fetch: .from('video_sections').select('content').eq('video_id', ...)
  const sectionsEqMock = vi.fn().mockResolvedValue({
    data: sectionsData,
    error: sectionsError,
  })
  const sectionsSelectMock = vi.fn().mockReturnValue({ eq: sectionsEqMock })

  createClientMock.mockResolvedValue({
    from: vi.fn((table: string) => {
      if (table === 'videos') return { select: videoSelectMock }
      if (table === 'video_sections') return { select: sectionsSelectMock }
      return {}
    }),
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('deleteVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when user is not authenticated', async () => {
    getCurrentUserMock.mockResolvedValue(null)
    const result = await deleteVideo('video-1')
    expect(result.error).toBe('No autenticado.')
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('returns error when video is not found or not owned', async () => {
    getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
    mockSupabase({ videoRow: null })
    const result = await deleteVideo('video-1')
    expect(result.error).toBe('Video no encontrado.')
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('returns error when fetch fails', async () => {
    getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
    mockSupabase({ fetchError: { message: 'db error' } })
    const result = await deleteVideo('video-1')
    expect(result.error).toBe('Error al verificar el video.')
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('returns error when delete fails', async () => {
    getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
    mockSupabase({ deleteError: { message: 'constraint violation' } })
    const result = await deleteVideo('video-1')
    expect(result.error).toBe('No se pudo eliminar el video.')
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('returns empty object and revalidates path on success', async () => {
    getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
    mockSupabase()
    const result = await deleteVideo('video-1')
    expect(result).toEqual({})
    expect(result.error).toBeUndefined()
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/videos')
    expect(updateTagMock).toHaveBeenCalledWith('dashboard-user-1')
  })
})

describe('getVideoSectionStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when user is not authenticated', async () => {
    getCurrentUserMock.mockResolvedValue(null)
    const result = await getVideoSectionStats('video-1')
    expect(result.error).toBe('No autenticado.')
    expect(result.data).toBeUndefined()
  })

  it('returns error when video fetch fails', async () => {
    getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
    mockSupabaseForStats({ videoFetchError: { message: 'db error' } })
    const result = await getVideoSectionStats('video-1')
    expect(result.error).toBe('Error al verificar el video.')
    expect(result.data).toBeUndefined()
  })

  it('returns error when video is not found or not owned', async () => {
    getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
    mockSupabaseForStats({ videoRow: null })
    const result = await getVideoSectionStats('video-1')
    expect(result.error).toBe('Video no encontrado.')
    expect(result.data).toBeUndefined()
  })

  it('returns error when sections fetch fails', async () => {
    getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
    mockSupabaseForStats({
      sectionsData: null,
      sectionsError: { message: 'db error' },
    })
    const result = await getVideoSectionStats('video-1')
    expect(result.error).toBe('No se pudieron cargar las estadísticas.')
    expect(result.data).toBeUndefined()
  })

  it('returns correct section count and content size', async () => {
    getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
    mockSupabaseForStats({
      sectionsData: [
        { content: 'hello world' }, // 11 chars
        { content: 'foo bar baz' }, // 11 chars
        { content: null }, // 0 chars
      ],
    })
    const result = await getVideoSectionStats('video-1')
    expect(result.error).toBeUndefined()
    expect(result.data).toEqual({ sectionCount: 3, contentSizeChars: 22 })
  })

  it('returns zero stats when video has no sections', async () => {
    getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
    mockSupabaseForStats({ sectionsData: [] })
    const result = await getVideoSectionStats('video-1')
    expect(result.data).toEqual({ sectionCount: 0, contentSizeChars: 0 })
  })
})
