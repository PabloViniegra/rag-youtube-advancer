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
// Embedding — pipeline domain types
// ─────────────────────────────────────────────

/** A plain text segment produced by the chunking phase, ready for embedding. */
export interface TextChunk {
  /** The text content of the segment. */
  content: string
  /** 0-based position within the original document. */
  index: number
}

/** A TextChunk paired with its 1536-dimension vector embedding. */
export interface EmbeddedChunk {
  /** The text content of the segment. */
  content: string
  /** 0-based position within the original document. */
  index: number
  /** 1536-dimension vector produced by the embedding model. */
  embedding: number[]
}

// ─────────────────────────────────────────────
// Embedding — API layer
// ─────────────────────────────────────────────

export const EMBED_API_ERROR = {
  /** The `chunks` field is missing, empty, or not a string array. */
  MISSING_CHUNKS: 'missing_chunks',
  /** The request body is not valid JSON. */
  INVALID_BODY: 'invalid_body',
  /** The user is not authenticated. */
  UNAUTHORIZED: 'unauthorized',
  /** The user does not have an active subscription or admin role. */
  FORBIDDEN: 'forbidden',
  /** Unexpected server-side failure. */
  INTERNAL_ERROR: 'internal_error',
} as const

export type EmbedApiErrorCode =
  (typeof EMBED_API_ERROR)[keyof typeof EMBED_API_ERROR]

/** Body expected by `POST /api/embed`. */
export interface EmbedRequest {
  /**
   * Ordered array of plain-text segments produced by Phase 2 (chunking).
   * Each element becomes one EmbeddedChunk in the response.
   */
  chunks: string[]
}

/** Shape returned on success. */
export interface EmbedSuccessResponse {
  /** Embedded segments with their vector representations. */
  data: EmbeddedChunk[]
  /** Convenience count — equals `data.length`. */
  count: number
}

/** Shape returned on error. */
export interface EmbedErrorResponse {
  error: string
  code: EmbedApiErrorCode
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
