// ─────────────────────────────────────────────
// Augmentation — domain types (Phase 6 RAG pipeline)
// ─────────────────────────────────────────────

import type { VideoSectionMatch } from '@/lib/retrieval/types'

// ─────────────────────────────────────────────
// Augmentation — streaming chunk types
// ─────────────────────────────────────────────

/** Alias kept for clarity — stream sources share the retrieval type. */
export type AugmentSource = VideoSectionMatch

/**
 * Discriminated union for SSE stream chunks emitted by `augmentAnswerStream`.
 *
 * - `sources`  — emitted once up-front with all retrieved sections.
 * - `token`    — emitted per LLM text delta.
 * - `done`     — emitted once when generation is complete, with related queries.
 */
export type AugmentStreamChunk =
  | { type: 'sources'; payload: AugmentSource[] }
  | { type: 'token'; payload: string }
  | { type: 'done'; relatedQueries: string[] }

/**
 * Parameters for an LLM augmentation call.
 *
 * @field query   - Raw natural-language question from the user.
 * @field matches - Retrieved video sections used as RAG context.
 */
export interface AugmentationInput {
  query: string
  matches: VideoSectionMatch[]
}

/**
 * Result of a successful augmentation call.
 *
 * @field answer      - LLM-generated answer grounded in the retrieved context.
 * @field sources     - The video sections passed as context to the LLM.
 * @field sourceCount - Convenience total — equals `sources.length`.
 */
export interface AugmentationResult {
  answer: string
  sources: VideoSectionMatch[]
  sourceCount: number
}

// ─────────────────────────────────────────────
// Augmentation — LLM config
// ─────────────────────────────────────────────

export interface AugmentationConfig {
  model: string
  maxOutputTokens: number
}

export const AUGMENTATION_CONFIG = {
  model: 'openai/gpt-4o-mini',
  maxOutputTokens: 1024,
} as const satisfies AugmentationConfig

// ─────────────────────────────────────────────
// Augmentation — API layer error codes
// ─────────────────────────────────────────────

export const AUGMENT_API_ERROR = {
  /** The `query` field is missing or empty. */
  INVALID_BODY: 'invalid_body',
  /** The user is not authenticated. */
  UNAUTHORIZED: 'unauthorized',
  /** The user does not have an active subscription or admin role. */
  FORBIDDEN: 'forbidden',
  /** No relevant sections were found for the query. */
  NO_CONTEXT: 'no_context',
  /** Unexpected server-side failure. */
  INTERNAL_ERROR: 'internal_error',
} as const

export type AugmentApiErrorCode =
  (typeof AUGMENT_API_ERROR)[keyof typeof AUGMENT_API_ERROR]

// ─────────────────────────────────────────────
// Augmentation — API layer request / response
// ─────────────────────────────────────────────

/** Default retrieval config used by the augmentation endpoint. */
export const AUGMENT_DEFAULTS = {
  matchThreshold: 0.7,
  matchCount: 5,
} as const

/** Body expected by `POST /api/augment`. */
export interface AugmentRequest {
  /** Raw natural-language question. */
  query: string
  /**
   * Minimum cosine similarity threshold [0, 1].
   * Defaults to 0.7 when omitted.
   */
  matchThreshold?: number
  /**
   * Maximum number of context sections to retrieve.
   * Defaults to 5 when omitted.
   */
  matchCount?: number
}

/** Shape returned on success. */
export interface AugmentSuccessResponse {
  /** LLM-generated answer grounded in the retrieved video context. */
  answer: string
  /** The video sections used as context. */
  sources: VideoSectionMatch[]
  /** Convenience total — equals `sources.length`. */
  sourceCount: number
}

/** Shape returned on error. */
export interface AugmentErrorResponse {
  error: string
  code: AugmentApiErrorCode
}
