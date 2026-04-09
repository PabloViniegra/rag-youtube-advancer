/**
 * YouTube transcript extraction service.
 *
 * Wraps the `youtube-transcript` npm package so that:
 *   1. Consumers deal only with our own domain types.
 *   2. Library-specific errors are translated to `TranscriptFetchError`
 *      with a typed `code` field from `TRANSCRIPT_ERROR`.
 */
import {
  YoutubeTranscript,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptNotAvailableLanguageError,
  YoutubeTranscriptTooManyRequestError,
  YoutubeTranscriptVideoUnavailableError,
} from 'youtube-transcript'
import { extractVideoId } from './extract-video-id'
import {
  TRANSCRIPT_ERROR,
  type TranscriptErrorCode,
  type TranscriptResult,
  type TranscriptSegment,
} from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Custom error
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Thrown by `fetchYoutubeTranscript` for all recoverable failure modes.
 * Callers can inspect `.code` to decide on the HTTP status to return.
 */
export class TranscriptFetchError extends Error {
  readonly code: TranscriptErrorCode

  constructor(code: TranscriptErrorCode, message: string) {
    super(message)
    this.name = 'TranscriptFetchError'
    this.code = code
    // Ensure the stack trace points to the throw site, not the Error base class.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TranscriptFetchError)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface FetchTranscriptOptions {
  /**
   * Preferred BCP-47 language code (e.g. "en", "es").
   * When omitted the library picks the first available language.
   */
  lang?: string
}

/**
 * Fetches the transcript for a YouTube video.
 *
 * @param url  Any supported YouTube URL (watch, youtu.be, embed, shorts…).
 * @param opts Optional language preference.
 * @returns    A `TranscriptResult` with typed segments and combined full text.
 * @throws     `TranscriptFetchError` for all known failure modes.
 */
export async function fetchYoutubeTranscript(
  url: string,
  opts: FetchTranscriptOptions = {},
): Promise<TranscriptResult> {
  const videoId = extractVideoId(url)

  if (!videoId) {
    throw new TranscriptFetchError(
      TRANSCRIPT_ERROR.INVALID_URL,
      `"${url}" is not a valid YouTube URL or contains no video ID.`,
    )
  }

  try {
    const raw = await YoutubeTranscript.fetchTranscript(
      videoId,
      opts.lang ? { lang: opts.lang } : undefined,
    )

    const transcript: TranscriptSegment[] = raw.map((item) => ({
      text: item.text,
      offset: item.offset,
      duration: item.duration,
      ...(item.lang !== undefined ? { lang: item.lang } : {}),
    }))

    const fullText = transcript
      .map((s) => s.text.trim())
      .filter(Boolean)
      .join(' ')

    return { videoId, transcript, fullText }
  } catch (error) {
    // Re-throw our own errors unchanged
    if (error instanceof TranscriptFetchError) throw error

    // Map library-specific errors to typed codes
    if (error instanceof YoutubeTranscriptDisabledError) {
      throw new TranscriptFetchError(
        TRANSCRIPT_ERROR.TRANSCRIPTS_DISABLED,
        `Transcripts are disabled for video "${videoId}".`,
      )
    }

    if (error instanceof YoutubeTranscriptNotAvailableError) {
      throw new TranscriptFetchError(
        TRANSCRIPT_ERROR.TRANSCRIPT_NOT_AVAILABLE,
        `No transcript is available for video "${videoId}".`,
      )
    }

    if (error instanceof YoutubeTranscriptNotAvailableLanguageError) {
      throw new TranscriptFetchError(
        TRANSCRIPT_ERROR.LANGUAGE_NOT_AVAILABLE,
        `The requested language is not available for video "${videoId}".`,
      )
    }

    if (error instanceof YoutubeTranscriptVideoUnavailableError) {
      throw new TranscriptFetchError(
        TRANSCRIPT_ERROR.VIDEO_UNAVAILABLE,
        `Video "${videoId}" is unavailable (private or deleted).`,
      )
    }

    if (error instanceof YoutubeTranscriptTooManyRequestError) {
      throw new TranscriptFetchError(
        TRANSCRIPT_ERROR.TOO_MANY_REQUESTS,
        'Too many requests to YouTube — please retry after a short delay.',
      )
    }

    // Unexpected error
    const message = error instanceof Error ? error.message : String(error)
    throw new TranscriptFetchError(
      TRANSCRIPT_ERROR.FETCH_FAILED,
      `Failed to fetch transcript for video "${videoId}": ${message}`,
    )
  }
}
