import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TRANSCRIPT_ERROR } from '@/lib/youtube/types'
import { ingestVideo } from './ingest'
import { INGEST_ERROR } from './types'

const {
  updateTagMock,
  createClientMock,
  getVideoCountMock,
  fetchYoutubeTranscriptMock,
  chunkTextMock,
  embedChunksMock,
  storeVideoSectionsMock,
  generateIntelligenceReportMock,
  generateSeoReportMock,
} = vi.hoisted(() => ({
  updateTagMock: vi.fn(),
  createClientMock: vi.fn(),
  getVideoCountMock: vi.fn(),
  fetchYoutubeTranscriptMock: vi.fn(),
  chunkTextMock: vi.fn(),
  embedChunksMock: vi.fn(),
  storeVideoSectionsMock: vi.fn(),
  generateIntelligenceReportMock: vi.fn(),
  generateSeoReportMock: vi.fn(),
}))

vi.mock('next/cache', () => ({
  updateTag: updateTagMock,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('@/lib/supabase/queries', () => ({
  getVideoCount: getVideoCountMock,
}))

vi.mock('@/lib/ai/chunk', () => ({
  chunkText: chunkTextMock,
}))

vi.mock('@/lib/ai/embed', () => ({
  embedChunks: embedChunksMock,
}))

vi.mock('@/lib/storage/store', () => ({
  storeVideoSections: storeVideoSectionsMock,
}))

vi.mock('@/lib/intelligence/generate', () => ({
  generateIntelligenceReport: generateIntelligenceReportMock,
}))

vi.mock('@/lib/seo/generate', () => ({
  generateSeoReport: generateSeoReportMock,
}))

vi.mock('@/lib/youtube/transcript', async () => {
  const actual = await vi.importActual<
    typeof import('@/lib/youtube/transcript')
  >('@/lib/youtube/transcript')

  return {
    ...actual,
    fetchYoutubeTranscript: fetchYoutubeTranscriptMock,
  }
})

import { TranscriptFetchError } from '@/lib/youtube/transcript'

const VALID_INPUT = {
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  title: 'Test Video',
}

const TRANSCRIPT_OK = {
  videoId: 'dQw4w9WgXcQ',
  fullText: 'This is the transcript text.',
}

const EMBED_OK = [{ content: 'chunk one', index: 0, embedding: [0.1, 0.2] }]

const REPORT_OK = {
  summary: {
    tldr: {
      context: 'c',
      mainArgument: 'm',
      conclusion: 'x',
    },
    timestamps: [{ time: '00:10', label: 'Intro' }],
    keyTakeaways: ['1', '2', '3', '4', '5'],
  },
  repurpose: {
    twitterThread: [
      { position: 1, content: 'a' },
      { position: 2, content: 'b' },
      { position: 3, content: 'c' },
      { position: 4, content: 'd' },
      { position: 5, content: 'e' },
      { position: 6, content: 'f' },
      { position: 7, content: 'g' },
    ],
    shortScript: {
      hook: 'h',
      body: 'b',
      cta: 'c',
      suggestedClip: 's',
    },
    linkedinPost: 'post',
    newsletterDraft: {
      subject: 'sub',
      body: 'body',
    },
  },
  analysis: {
    sentiment: {
      tone: 'educativo',
      confidence: 0.9,
      explanation: 'good',
    },
    entities: [{ name: 'React', type: 'concepto', context: 'ctx' }],
    suggestedQuestions: ['q1', 'q2', 'q3'],
  },
  generatedAt: '2025-01-01T00:00:00.000Z',
} as const

const SEO_OK = {
  seoPackage: {
    titleVariants: [
      { variant: 'A', title: 'A', rationale: 'a' },
      { variant: 'B', title: 'B', rationale: 'b' },
      { variant: 'C', title: 'C', rationale: 'c' },
    ],
    description: 'desc',
    tags: [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
    ],
  },
  showNotes: {
    episodeTitle: 'ep',
    description: 'd',
    resources: ['r'],
    suggestedLinks: ['l'],
  },
  thumbnailBrief: {
    mainElement: 'm',
    textOverlay: 't',
    emotionalTone: 'e',
    composition: 'c',
    colorSuggestions: ['red', 'blue', 'green'],
  },
  generatedAt: '2025-01-01T00:00:00.000Z',
} as const

function setupSupabase(user: { id: string } | null = { id: 'user-1' }) {
  const profileMaybeSingleMock = vi.fn().mockResolvedValue({
    data: { role: 'user', subscription_active: false, trial_used: false },
    error: null,
  })

  const profileSelectEqMock = vi
    .fn()
    .mockReturnValue({ maybeSingle: profileMaybeSingleMock })
  const profileSelectMock = vi.fn().mockReturnValue({ eq: profileSelectEqMock })

  const profileUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
  const profileUpdateMock = vi.fn().mockReturnValue({ eq: profileUpdateEqMock })

  const reportSingleMock = vi.fn().mockResolvedValue({
    data: { id: 'report-1' },
    error: null,
  })
  const reportSelectMock = vi.fn().mockReturnValue({ single: reportSingleMock })
  const reportUpsertMock = vi.fn().mockReturnValue({ select: reportSelectMock })

  const seoSingleMock = vi.fn().mockResolvedValue({
    data: { id: 'seo-1' },
    error: null,
  })
  const seoSelectMock = vi.fn().mockReturnValue({ single: seoSingleMock })
  const seoUpsertMock = vi.fn().mockReturnValue({ select: seoSelectMock })

  const fromMock = vi.fn((table: string) => {
    if (table === 'profiles') {
      return {
        select: profileSelectMock,
        update: profileUpdateMock,
      }
    }

    if (table === 'intelligence_reports') {
      return { upsert: reportUpsertMock }
    }

    if (table === 'seo_reports') {
      return { upsert: seoUpsertMock }
    }

    return {
      select: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    }
  })

  createClientMock.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: fromMock,
  })
}

describe('ingestVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupSupabase()

    getVideoCountMock.mockResolvedValue(0)
    fetchYoutubeTranscriptMock.mockResolvedValue(TRANSCRIPT_OK)
    chunkTextMock.mockReturnValue(['chunk one'])
    embedChunksMock.mockResolvedValue(EMBED_OK)
    storeVideoSectionsMock.mockResolvedValue({
      videoId: 'vid-uuid-123',
      count: 1,
    })
    generateIntelligenceReportMock.mockResolvedValue(REPORT_OK)
    generateSeoReportMock.mockResolvedValue(SEO_OK)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('returns success when all phases succeed', async () => {
    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.videoId).toBe('vid-uuid-123')
    expect(result.sectionCount).toBe(1)
    expect(updateTagMock).toHaveBeenCalledWith('dashboard-user-1')
  })

  it('calls pipeline phases with expected payloads', async () => {
    await ingestVideo(VALID_INPUT)

    expect(fetchYoutubeTranscriptMock).toHaveBeenCalledWith(
      VALID_INPUT.youtubeUrl,
    )
    expect(chunkTextMock).toHaveBeenCalledWith(
      TRANSCRIPT_OK.fullText,
      expect.any(Object),
    )
    expect(embedChunksMock).toHaveBeenCalledWith(['chunk one'])
    expect(storeVideoSectionsMock).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        youtubeId: TRANSCRIPT_OK.videoId,
        title: VALID_INPUT.title,
        userId: 'user-1',
      }),
    )
  })

  it('returns UNAUTHORIZED when no authenticated user exists', async () => {
    setupSupabase(null)

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.UNAUTHORIZED)
  })

  it('returns VIDEO_LIMIT_REACHED when free trial is already used', async () => {
    const profileMaybeSingleMock = vi.fn().mockResolvedValue({
      data: { role: 'user', subscription_active: false, trial_used: true },
      error: null,
    })

    const profileSelectEqMock = vi
      .fn()
      .mockReturnValue({ maybeSingle: profileMaybeSingleMock })
    const profileSelectMock = vi
      .fn()
      .mockReturnValue({ eq: profileSelectEqMock })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
      },
      from: vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: profileSelectMock,
            update: vi.fn().mockReturnValue({ eq: vi.fn() }),
          }
        }
        return { select: vi.fn(), upsert: vi.fn(), update: vi.fn() }
      }),
    })

    getVideoCountMock.mockResolvedValue(1)

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.VIDEO_LIMIT_REACHED)
  })

  it('maps INVALID_URL transcript error correctly', async () => {
    fetchYoutubeTranscriptMock.mockRejectedValueOnce(
      new TranscriptFetchError(TRANSCRIPT_ERROR.INVALID_URL, 'URL inválida'),
    )

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.INVALID_URL)
    expect(result.message).toBe('URL inválida')
  })

  it('returns TRANSCRIPT_FAILED on non-transcript exceptions', async () => {
    fetchYoutubeTranscriptMock.mockRejectedValueOnce(new Error('boom'))

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.TRANSCRIPT_FAILED)
    expect(result.message).toBe('Transcript extraction failed.')
  })

  it('returns CHUNK_FAILED when no chunks are generated', async () => {
    chunkTextMock.mockReturnValueOnce([])

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.CHUNK_FAILED)
  })

  it('returns EMBED_FAILED when embed phase throws', async () => {
    embedChunksMock.mockRejectedValueOnce(new Error('embed down'))

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.EMBED_FAILED)
    expect(result.message).toBe('embed down')
  })

  it('returns STORE_FAILED when store phase throws', async () => {
    storeVideoSectionsMock.mockRejectedValueOnce(new Error('db write failed'))

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe(INGEST_ERROR.STORE_FAILED)
    expect(result.message).toBe('db write failed')
  })

  it('keeps success when intelligence report generation fails (graceful)', async () => {
    generateIntelligenceReportMock.mockRejectedValueOnce(new Error('llm down'))

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.report).toBeNull()
    expect(result.seoReport).toBeNull()
    expect(generateSeoReportMock).not.toHaveBeenCalled()
  })

  it('keeps success when SEO generation fails (graceful)', async () => {
    generateSeoReportMock.mockRejectedValueOnce(new Error('seo down'))

    const result = await ingestVideo(VALID_INPUT)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.report).not.toBeNull()
    expect(result.seoReport).toBeNull()
  })
})
