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
