// ─────────────────────────────────────────────
// Retrieval — domain types (Phase 5 RAG pipeline)
// ─────────────────────────────────────────────

/**
 * Parameters for a semantic similarity search.
 *
 * @field query          - Raw natural-language query from the user.
 * @field userId         - Authenticated user's UUID (scopes results to their videos).
 * @field matchThreshold - Minimum cosine similarity score [0, 1] (default 0.7).
 * @field matchCount     - Maximum number of sections to return (default 5).
 */
export interface RetrievalInput {
  query: string
  userId: string
  matchThreshold: number
  matchCount: number
}

/**
 * A single matched video section returned from the RPC call.
 *
 * @field id         - UUID of the video_sections row.
 * @field videoId    - UUID of the parent videos row.
 * @field content    - Text content of the matched section.
 * @field similarity - Cosine similarity score between query and section vectors.
 */
export interface VideoSectionMatch {
  id: string
  videoId: string
  content: string
  similarity: number
}

/**
 * Result returned by a successful retrieval operation.
 *
 * @field matches - Ordered array of matching sections (highest similarity first).
 * @field count   - Convenience total — equals `matches.length`.
 */
export interface RetrievalResult {
  matches: VideoSectionMatch[]
  count: number
}

// ─────────────────────────────────────────────
// Retrieval — API layer error codes
// ─────────────────────────────────────────────

export const RETRIEVE_API_ERROR = {
  /** Required fields are missing or invalid. */
  INVALID_BODY: 'invalid_body',
  /** The user is not authenticated. */
  UNAUTHORIZED: 'unauthorized',
  /** The user does not have an active subscription or admin role. */
  FORBIDDEN: 'forbidden',
  /** Unexpected server-side failure. */
  INTERNAL_ERROR: 'internal_error',
} as const

export type RetrieveApiErrorCode =
  (typeof RETRIEVE_API_ERROR)[keyof typeof RETRIEVE_API_ERROR]

// ─────────────────────────────────────────────
// Retrieval — API layer request / response shapes
// ─────────────────────────────────────────────

/** Default retrieval config values. */
export const RETRIEVE_DEFAULTS = {
  matchThreshold: 0.7,
  matchCount: 5,
} as const

/** Body expected by `POST /api/retrieve`. */
export interface RetrieveRequest {
  /** Raw natural-language query text. */
  query: string
  /**
   * Minimum cosine similarity threshold [0, 1].
   * Defaults to 0.7 when omitted.
   */
  matchThreshold?: number
  /**
   * Maximum number of matching sections to return.
   * Defaults to 5 when omitted.
   */
  matchCount?: number
}

/** Shape returned on success. */
export interface RetrieveSuccessResponse {
  /** Ordered array of matched sections (highest similarity first). */
  matches: VideoSectionMatch[]
  /** Convenience total — equals `matches.length`. */
  count: number
}

/** Shape returned on error. */
export interface RetrieveErrorResponse {
  error: string
  code: RetrieveApiErrorCode
}
