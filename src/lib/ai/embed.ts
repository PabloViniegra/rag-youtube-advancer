/**
 * Embedding utilities backed by Vercel AI Gateway.
 *
 * generateEmbedding  — single text   → number[]
 * generateEmbeddings — batch texts   → number[][]
 *
 * Newlines are collapsed to spaces before embedding; this is the recommended
 * pre-processing step from OpenAI to improve embedding quality.
 */
import { embed, embedMany } from 'ai'
import { aiGateway } from './gateway'
import { EMBEDDING_CONFIG } from './types'

function normalize(text: string): string {
  return text.replace(/\n+/g, ' ').trim()
}

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
