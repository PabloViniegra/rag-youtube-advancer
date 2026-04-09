// ─────────────────────────────────────────────────────────────────────────────
// YouTube Transcript — Domain Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single timed caption segment returned by the transcript API.
 * Mirrors `TranscriptResponse` from the `youtube-transcript` package
 * so that consumers are decoupled from the external library.
 */
export interface TranscriptSegment {
  /** Caption text, may contain HTML entities already decoded. */
  text: string
  /** Start time in milliseconds from the beginning of the video. */
  offset: number
  /** Duration of the segment in milliseconds. */
  duration: number
  /** BCP-47 language code, e.g. "en", "es". Optional. */
  lang?: string
}

/**
 * Aggregated result of a successful transcript extraction.
 */
export interface TranscriptResult {
  /** YouTube video ID (11-character alphanumeric string). */
  videoId: string
  /** Ordered list of timed transcript segments. */
  transcript: TranscriptSegment[]
  /** Plain text formed by joining all segment texts with a single space. */
  fullText: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Error codes (const-first pattern so values are runtime-accessible)
// ─────────────────────────────────────────────────────────────────────────────

export const TRANSCRIPT_ERROR = {
  /** The user is not authenticated. */
  UNAUTHORIZED: 'unauthorized',
  /** The supplied URL is not a valid YouTube URL or contains no video ID. */
  INVALID_URL: 'invalid_url',
  /** The video does not exist or is private/unavailable. */
  VIDEO_UNAVAILABLE: 'video_unavailable',
  /** Transcripts are disabled for this video by the owner. */
  TRANSCRIPTS_DISABLED: 'transcripts_disabled',
  /** No transcript is available (no captions were ever created). */
  TRANSCRIPT_NOT_AVAILABLE: 'transcript_not_available',
  /** The requested language is not available; includes available alternatives. */
  LANGUAGE_NOT_AVAILABLE: 'language_not_available',
  /** YouTube is rate-limiting requests. */
  TOO_MANY_REQUESTS: 'too_many_requests',
  /** Unexpected error fetching or parsing the transcript. */
  FETCH_FAILED: 'fetch_failed',
} as const

export type TranscriptErrorCode =
  (typeof TRANSCRIPT_ERROR)[keyof typeof TRANSCRIPT_ERROR]

// ─────────────────────────────────────────────────────────────────────────────
// Route Handler — Request / Response shapes
// ─────────────────────────────────────────────────────────────────────────────

/** Body expected by `POST /api/transcript`. */
export interface TranscriptRequest {
  /** Full YouTube URL (any supported format). */
  url: string
  /**
   * Optional BCP-47 language code to prefer (e.g. "en", "es").
   * Falls back to the first available language if omitted.
   */
  lang?: string
}

/** Shape returned on success. */
export type TranscriptSuccessResponse = TranscriptResult

/** Shape returned on error. */
export interface TranscriptErrorResponse {
  error: string
  code: TranscriptErrorCode
}
