// ─────────────────────────────────────────────
// Storage — domain types (Phase 4 RAG pipeline)
// ─────────────────────────────────────────────

import type { EmbeddedChunk } from '@/lib/ai/types'

/**
 * Input required to store a video and all its embedded sections.
 *
 * @field youtubeId  - The YouTube video ID (e.g. "dQw4w9WgXcQ").
 * @field title      - Human-readable title for the video row.
 * @field userId     - Authenticated user's UUID (from Supabase auth).
 * @field sections   - EmbeddedChunks produced by Phase 3 (Embedding).
 */
export interface StoreVideoInput {
  youtubeId: string
  title: string
  userId: string
  sections: EmbeddedChunk[]
}

/**
 * Result returned by a successful storage operation.
 *
 * @field videoId - UUID of the (upserted) videos row.
 * @field count   - Number of video_sections rows inserted.
 */
export interface StoreVideoResult {
  videoId: string
  count: number
}

// ─────────────────────────────────────────────
// Storage — API layer error codes
// ─────────────────────────────────────────────

export const STORE_API_ERROR = {
  /** Required fields are missing or invalid. */
  INVALID_BODY: 'invalid_body',
  /** The user is not authenticated. */
  UNAUTHORIZED: 'unauthorized',
  /** The user does not have an active subscription or admin role. */
  FORBIDDEN: 'forbidden',
  /** Unexpected server-side failure. */
  INTERNAL_ERROR: 'internal_error',
} as const

export type StoreApiErrorCode =
  (typeof STORE_API_ERROR)[keyof typeof STORE_API_ERROR]

/** Body expected by `POST /api/store`. */
export interface StoreRequest {
  /** YouTube video ID (e.g. "dQw4w9WgXcQ"). */
  youtubeId: string
  /** Human-readable video title. */
  title: string
  /**
   * Ordered array of EmbeddedChunks from Phase 3.
   * Each element has `content`, `index`, and `embedding`.
   */
  sections: EmbeddedChunk[]
}

/** Shape returned on success. */
export interface StoreSuccessResponse {
  /** UUID of the (upserted) videos row. */
  videoId: string
  /** Number of video_sections rows inserted. */
  count: number
}

/** Shape returned on error. */
export interface StoreErrorResponse {
  error: string
  code: StoreApiErrorCode
}
