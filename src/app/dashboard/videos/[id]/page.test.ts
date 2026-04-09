/**
 * Tests for VideoDetailPage — Server Component
 *
 * Mocks `next/navigation` (redirect/notFound) and `@/lib/supabase/server`
 * so we can exercise the auth gate, 404 path, and success render path
 * without a real Supabase or Next.js runtime.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { createClientMock, redirectMock, notFoundMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  redirectMock: vi.fn(),
  notFoundMock: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
  notFound: notFoundMock,
}))

// Mock child components to avoid rendering complexity
vi.mock('./_components/video-detail-header', () => ({
  VideoDetailHeader: () => null,
}))

vi.mock('./_components/video-sections-list', () => ({
  VideoSectionsList: () => null,
}))

vi.mock('./_components/video-report-tabs', () => ({
  VideoReportTabs: () => null,
}))

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import VideoDetailPage, { generateMetadata } from './page'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const VIDEO_ROW = {
  id: 'vid-1',
  user_id: 'user-1',
  youtube_id: 'dQw4w9WgXcQ',
  title: 'My Test Video',
  created_at: '2024-01-01T00:00:00.000Z',
}

const SECTION_ROWS = [
  { id: 'sec-1', content: 'First section content.' },
  { id: 'sec-2', content: 'Second section content.' },
]

// ─── Supabase mock helpers ─────────────────────────────────────────────────────

function _buildChain(responses: Record<string, unknown>) {
  const chain: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(responses)) {
    chain[key] = vi.fn().mockReturnValue(value)
  }
  return chain
}

type SupabaseMockConfig = {
  user: { id: string } | null
  videoData: unknown
  videoError: unknown
  sectionsData: unknown
  reportData?: unknown
  seoReportData?: unknown
}

function mockSupabase({
  user,
  videoData,
  videoError,
  sectionsData,
  reportData = null,
  seoReportData = null,
}: SupabaseMockConfig) {
  const getUserResult = { data: { user } }

  // Build the query chain for videos table
  const videosMaybeSingle = vi
    .fn()
    .mockResolvedValue({ data: videoData, error: videoError })
  const videosEqUserId = vi
    .fn()
    .mockReturnValue({ maybeSingle: videosMaybeSingle })
  const videosEqId = vi
    .fn()
    .mockReturnValue({ eq: videosEqUserId, maybeSingle: videosMaybeSingle })
  const _videosSelectAll = vi.fn().mockReturnValue({ eq: videosEqId })
  const _videosSelectTitle = vi
    .fn()
    .mockReturnValue({ eq: videosEqId, maybeSingle: videosMaybeSingle })

  // Build the query chain for video_sections table
  const sectionsOrdered = vi.fn().mockResolvedValue({ data: sectionsData })
  const sectionsEq = vi.fn().mockReturnValue({ order: sectionsOrdered })
  const sectionsSelect = vi.fn().mockReturnValue({ eq: sectionsEq })

  // Build the query chain for intelligence_reports table
  const reportMaybeSingle = vi
    .fn()
    .mockResolvedValue({ data: reportData, error: null })
  const reportEq = vi.fn().mockReturnValue({ maybeSingle: reportMaybeSingle })
  const reportSelect = vi.fn().mockReturnValue({ eq: reportEq })

  // Build the query chain for seo_reports table
  const seoReportMaybeSingle = vi
    .fn()
    .mockResolvedValue({ data: seoReportData, error: null })
  const seoReportEq = vi
    .fn()
    .mockReturnValue({ maybeSingle: seoReportMaybeSingle })
  const seoReportSelect = vi.fn().mockReturnValue({ eq: seoReportEq })

  const fromMock = vi.fn().mockImplementation((table: string) => {
    if (table === 'videos') {
      return {
        select: vi.fn().mockImplementation((fields: string) => {
          if (fields === 'title') return { eq: videosEqId }
          // '*' or other
          return { eq: videosEqId }
        }),
      }
    }
    if (table === 'video_sections') {
      return { select: sectionsSelect }
    }
    if (table === 'intelligence_reports') {
      return { select: reportSelect }
    }
    if (table === 'seo_reports') {
      return { select: seoReportSelect }
    }
    return {}
  })

  createClientMock.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue(getUserResult),
    },
    from: fromMock,
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('VideoDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    notFoundMock.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND')
    })
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`)
    })
  })

  it('redirects to login when user is not authenticated', async () => {
    mockSupabase({
      user: null,
      videoData: null,
      videoError: null,
      sectionsData: [],
    })

    await expect(
      VideoDetailPage({ params: Promise.resolve({ id: 'vid-1' }) }),
    ).rejects.toThrow('NEXT_REDIRECT:/login?redirectTo=/dashboard/videos/vid-1')
  })

  it('calls notFound when video does not exist', async () => {
    mockSupabase({
      user: { id: 'user-1' },
      videoData: null,
      videoError: { message: 'not found' },
      sectionsData: [],
    })

    await expect(
      VideoDetailPage({ params: Promise.resolve({ id: 'nonexistent' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('calls notFound when video query returns null data', async () => {
    mockSupabase({
      user: { id: 'user-1' },
      videoData: null,
      videoError: null,
      sectionsData: [],
    })

    await expect(
      VideoDetailPage({ params: Promise.resolve({ id: 'vid-1' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('renders the page successfully with video and sections', async () => {
    mockSupabase({
      user: { id: 'user-1' },
      videoData: VIDEO_ROW,
      videoError: null,
      sectionsData: SECTION_ROWS,
    })

    const result = await VideoDetailPage({
      params: Promise.resolve({ id: 'vid-1' }),
    })
    expect(result).not.toBeNull()
  })

  it('renders when sections query returns null (empty state)', async () => {
    mockSupabase({
      user: { id: 'user-1' },
      videoData: VIDEO_ROW,
      videoError: null,
      sectionsData: null,
    })

    const result = await VideoDetailPage({
      params: Promise.resolve({ id: 'vid-1' }),
    })
    expect(result).not.toBeNull()
  })

  it('renders successfully when both intelligence and SEO reports are present', async () => {
    mockSupabase({
      user: { id: 'user-1' },
      videoData: VIDEO_ROW,
      videoError: null,
      sectionsData: SECTION_ROWS,
      reportData: { report: { summary: { timestamps: [] } } },
      seoReportData: {
        report: {
          seoPackage: {},
          showNotes: {},
          thumbnailBrief: {},
          generatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    })

    const result = await VideoDetailPage({
      params: Promise.resolve({ id: 'vid-1' }),
    })
    expect(result).not.toBeNull()
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns video title in metadata', async () => {
    const maybeSingle = vi
      .fn()
      .mockResolvedValue({ data: { title: 'My Video' } })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })

    createClientMock.mockResolvedValue({
      from: vi.fn().mockReturnValue({ select }),
    })

    const meta = await generateMetadata({
      params: Promise.resolve({ id: 'vid-1' }),
    })
    expect(meta.title).toBe('My Video — Dashboard')
  })

  it('falls back to "Video" when title is not found', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })

    createClientMock.mockResolvedValue({
      from: vi.fn().mockReturnValue({ select }),
    })

    const meta = await generateMetadata({
      params: Promise.resolve({ id: 'nonexistent' }),
    })
    expect(meta.title).toBe('Video — Dashboard')
  })
})
