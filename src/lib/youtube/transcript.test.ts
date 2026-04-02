import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptTooManyRequestError,
  YoutubeTranscriptVideoUnavailableError,
} from 'youtube-transcript'
import { fetchYoutubeTranscript, TranscriptFetchError } from './transcript'
import { TRANSCRIPT_ERROR } from './types'

// ─── Mock the external library ────────────────────────────────────────────────
vi.mock('youtube-transcript', async (importOriginal) => {
  const actual = await importOriginal<typeof import('youtube-transcript')>()
  return {
    ...actual,
    YoutubeTranscript: {
      fetchTranscript: vi.fn(),
    },
  }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
const VALID_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const VIDEO_ID = 'dQw4w9WgXcQ'

const MOCK_RAW = [
  { text: 'Hello world', offset: 0, duration: 1500 },
  { text: 'This is a test', offset: 1500, duration: 2000 },
]

async function getMock() {
  const { YoutubeTranscript } = await import('youtube-transcript')
  return YoutubeTranscript.fetchTranscript as ReturnType<typeof vi.fn>
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('fetchYoutubeTranscript', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Happy path ───────────────────────────────────────────────────────────
  it('returns a TranscriptResult on success', async () => {
    const mock = await getMock()
    mock.mockResolvedValueOnce(MOCK_RAW)

    const result = await fetchYoutubeTranscript(VALID_URL)

    expect(result.videoId).toBe(VIDEO_ID)
    expect(result.transcript).toHaveLength(2)
    expect(result.transcript[0]).toMatchObject({
      text: 'Hello world',
      offset: 0,
      duration: 1500,
    })
    expect(result.fullText).toBe('Hello world This is a test')
  })

  it('passes the lang option to the library', async () => {
    const mock = await getMock()
    mock.mockResolvedValueOnce(MOCK_RAW)

    await fetchYoutubeTranscript(VALID_URL, { lang: 'es' })

    expect(mock).toHaveBeenCalledWith(VIDEO_ID, { lang: 'es' })
  })

  it('does not pass lang when omitted', async () => {
    const mock = await getMock()
    mock.mockResolvedValueOnce(MOCK_RAW)

    await fetchYoutubeTranscript(VALID_URL)

    expect(mock).toHaveBeenCalledWith(VIDEO_ID, undefined)
  })

  // ── Invalid URL ───────────────────────────────────────────────────────────
  it('throws INVALID_URL for a non-YouTube URL', async () => {
    await expect(
      fetchYoutubeTranscript('https://vimeo.com/123'),
    ).rejects.toMatchObject({
      code: TRANSCRIPT_ERROR.INVALID_URL,
    })
  })

  it('throws INVALID_URL for an empty string', async () => {
    await expect(fetchYoutubeTranscript('')).rejects.toMatchObject({
      code: TRANSCRIPT_ERROR.INVALID_URL,
    })
  })

  it('throws INVALID_URL for a plain non-URL string', async () => {
    await expect(fetchYoutubeTranscript('not-a-url')).rejects.toMatchObject({
      code: TRANSCRIPT_ERROR.INVALID_URL,
    })
  })

  // ── Library error mapping ─────────────────────────────────────────────────
  it('maps YoutubeTranscriptDisabledError → TRANSCRIPTS_DISABLED', async () => {
    const mock = await getMock()
    mock.mockRejectedValueOnce(new YoutubeTranscriptDisabledError(VIDEO_ID))

    await expect(fetchYoutubeTranscript(VALID_URL)).rejects.toMatchObject({
      code: TRANSCRIPT_ERROR.TRANSCRIPTS_DISABLED,
    })
  })

  it('maps YoutubeTranscriptNotAvailableError → TRANSCRIPT_NOT_AVAILABLE', async () => {
    const mock = await getMock()
    mock.mockRejectedValueOnce(new YoutubeTranscriptNotAvailableError(VIDEO_ID))

    await expect(fetchYoutubeTranscript(VALID_URL)).rejects.toMatchObject({
      code: TRANSCRIPT_ERROR.TRANSCRIPT_NOT_AVAILABLE,
    })
  })

  it('maps YoutubeTranscriptVideoUnavailableError → VIDEO_UNAVAILABLE', async () => {
    const mock = await getMock()
    mock.mockRejectedValueOnce(
      new YoutubeTranscriptVideoUnavailableError(VIDEO_ID),
    )

    await expect(fetchYoutubeTranscript(VALID_URL)).rejects.toMatchObject({
      code: TRANSCRIPT_ERROR.VIDEO_UNAVAILABLE,
    })
  })

  it('maps YoutubeTranscriptTooManyRequestError → TOO_MANY_REQUESTS', async () => {
    const mock = await getMock()
    mock.mockRejectedValueOnce(new YoutubeTranscriptTooManyRequestError())

    await expect(fetchYoutubeTranscript(VALID_URL)).rejects.toMatchObject({
      code: TRANSCRIPT_ERROR.TOO_MANY_REQUESTS,
    })
  })

  it('maps unexpected errors → FETCH_FAILED', async () => {
    const mock = await getMock()
    mock.mockRejectedValueOnce(new Error('Network failure'))

    await expect(fetchYoutubeTranscript(VALID_URL)).rejects.toMatchObject({
      code: TRANSCRIPT_ERROR.FETCH_FAILED,
    })
  })

  it('re-throws TranscriptFetchError unchanged', async () => {
    const mock = await getMock()
    const original = new TranscriptFetchError(
      TRANSCRIPT_ERROR.FETCH_FAILED,
      'original',
    )
    mock.mockRejectedValueOnce(original)

    await expect(fetchYoutubeTranscript(VALID_URL)).rejects.toBe(original)
  })

  // ── Edge cases ────────────────────────────────────────────────────────────
  it('filters empty text segments from fullText', async () => {
    const mock = await getMock()
    mock.mockResolvedValueOnce([
      { text: 'Hello', offset: 0, duration: 500 },
      { text: '   ', offset: 500, duration: 200 },
      { text: 'World', offset: 700, duration: 500 },
    ])

    const result = await fetchYoutubeTranscript(VALID_URL)
    expect(result.fullText).toBe('Hello World')
  })
})
