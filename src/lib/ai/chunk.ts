/**
 * Text chunking for RAG ingestion.
 *
 * Splits a long transcript into overlapping segments so that context is
 * preserved across chunk boundaries.
 *
 * Default values match the architecture spec:
 *   size    = 1000 characters
 *   overlap = 200  characters
 *
 * The overlap window ensures that a sentence split across two chunks is
 * fully represented in at least one of them, reducing retrieval gaps.
 */
import { CHUNK_CONFIG, type ChunkConfig } from './types'

export function chunkText(
  text: string,
  config: ChunkConfig = CHUNK_CONFIG,
): string[] {
  const { size, overlap } = config
  const trimmed = text.trim()

  if (trimmed.length === 0) return []
  if (trimmed.length <= size) return [trimmed]

  const chunks: string[] = []
  let start = 0

  while (start < trimmed.length) {
    const end = start + size
    chunks.push(trimmed.slice(start, end))

    if (end >= trimmed.length) break
    start = end - overlap
  }

  return chunks.filter((chunk) => chunk.trim().length > 0)
}
