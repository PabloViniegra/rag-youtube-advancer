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

const { getCurrentUserMock, createClientMock, revalidatePathMock } = vi.hoisted(
  () => ({
    getCurrentUserMock: vi.fn(),
    createClientMock: vi.fn(),
    revalidatePathMock: vi.fn(),
  }),
)

vi.mock('@/lib/auth/actions', () => ({
  getCurrentUser: getCurrentUserMock,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}))

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { deleteVideo } from './actions'

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
  })
})
