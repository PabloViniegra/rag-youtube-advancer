// ─────────────────────────────────────────────
// Embedding
// ─────────────────────────────────────────────

export interface EmbeddingConfig {
  model: string
  dimensions: number
  maxParallelCalls: number
}

export const EMBEDDING_CONFIG = {
  model: 'openai/text-embedding-3-small',
  dimensions: 1536, // Must match vector(1536) in DB schema
  maxParallelCalls: 5,
} as const satisfies EmbeddingConfig

// ─────────────────────────────────────────────
// Chunking
// ─────────────────────────────────────────────

export interface ChunkConfig {
  size: number
  overlap: number
}

export const CHUNK_CONFIG = {
  size: 1000,
  overlap: 200,
} as const satisfies ChunkConfig

// ─────────────────────────────────────────────
// Chunking — API layer
// ─────────────────────────────────────────────

export const CHUNK_API_ERROR = {
  /** The `text` field is missing or empty. */
  MISSING_TEXT: 'missing_text',
  /** The request body is not valid JSON. */
  INVALID_BODY: 'invalid_body',
  /** `config.size` or `config.overlap` are not positive integers, or overlap >= size. */
  INVALID_CONFIG: 'invalid_config',
  /** Unexpected server-side failure. */
  INTERNAL_ERROR: 'internal_error',
} as const

export type ChunkApiErrorCode =
  (typeof CHUNK_API_ERROR)[keyof typeof CHUNK_API_ERROR]

/** Body expected by `POST /api/chunk`. */
export interface ChunkRequest {
  /** The plain text to be split into overlapping chunks. */
  text: string
  /**
   * Optional override for chunk parameters.
   * Falls back to `CHUNK_CONFIG` defaults (size 1000, overlap 200).
   */
  config?: Partial<ChunkConfig>
}

/** Shape returned on success. */
export interface ChunkSuccessResponse {
  /** Ordered array of text segments. */
  chunks: string[]
  /** Convenience count — equals `chunks.length`. */
  count: number
}

/** Shape returned on error. */
export interface ChunkErrorResponse {
  error: string
  code: ChunkApiErrorCode
}

// ─────────────────────────────────────────────
// Semantic search
// ─────────────────────────────────────────────

export interface VideoSectionMatch {
  id: string
  videoId: string
  content: string
  similarity: number
}

export interface SemanticSearchParams {
  queryEmbedding: number[]
  userId: string
  matchThreshold: number
  matchCount: number
}
