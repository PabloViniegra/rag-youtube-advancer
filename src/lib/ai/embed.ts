/**
 * Embedding utilities backed by Vercel AI Gateway.
 *
 * generateEmbedding  — single text   → number[]
 * generateEmbeddings — batch texts   → number[][]
 * embedChunks        — string[]      → EmbeddedChunk[]
 *
 * Newlines are collapsed to spaces before embedding; this is the recommended
 * pre-processing step from OpenAI to improve embedding quality.
 */
import { embed, embedMany } from 'ai'
import { aiGateway } from './gateway'
import type { EmbeddedChunk } from './types'
import { EMBEDDING_CONFIG } from './types'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function normalize(text: string): string {
  return text.replace(/\n+/g, ' ').trim()
}

// ─────────────────────────────────────────────
// Low-level embedding primitives
// ─────────────────────────────────────────────

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: aiGateway.textEmbeddingModel(EMBEDDING_CONFIG.model),
    value: normalize(text),
  })
  return embedding
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const { embeddings } = await embedMany({
    model: aiGateway.textEmbeddingModel(EMBEDDING_CONFIG.model),
    values: texts.map(normalize),
    maxParallelCalls: EMBEDDING_CONFIG.maxParallelCalls,
  })
  return embeddings
}

// ─────────────────────────────────────────────
// Phase 3 — RAG pipeline: embed chunks
// ─────────────────────────────────────────────

/**
 * Converts an ordered array of plain-text segments into EmbeddedChunks.
 *
 * Processes segments in batches to avoid gateway rate-limit spikes.
 * Each output element preserves the original `index` for downstream ordering.
 *
 * @param chunks    - Ordered text segments from the chunking phase.
 * @param batchSize - Number of segments sent per gateway call (default 20).
 * @returns         Promise resolving to the same segments plus their vectors.
 */
export async function embedChunks(
  chunks: string[],
  batchSize = 20,
): Promise<EmbeddedChunk[]> {
  if (chunks.length === 0) return []

  const results: EmbeddedChunk[] = []

  for (let start = 0; start < chunks.length; start += batchSize) {
    const batch = chunks.slice(start, start + batchSize)
    const embeddings = await generateEmbeddings(batch)

    for (let i = 0; i < batch.length; i++) {
      const content = batch[i]
      const embedding = embeddings[i]

      if (content === undefined || embedding === undefined) continue

      results.push({
        content,
        index: start + i,
        embedding,
      })
    }
  }

  return results
}
