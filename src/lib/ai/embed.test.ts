import { type EmbedManyResult, type EmbedResult, embed, embedMany } from 'ai'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateEmbedding, generateEmbeddings } from './embed'
import { EMBEDDING_CONFIG } from './types'

vi.mock('ai', () => {
  return {
    createGateway: vi.fn(() => {
      return {
        textEmbeddingModel: vi.fn((model: string) => `mock-model:${model}`),
      }
    }),
    embed: vi.fn(),
    embedMany: vi.fn(),
  }
})

describe('embedding helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createEmbedResult(value: string, embedding: number[]): EmbedResult {
    return {
      value,
      embedding,
      usage: {
        tokens: embedding.length,
      },
      warnings: [],
    }
  }

  function createEmbedManyResult(
    values: string[],
    embeddings: number[][],
  ): EmbedManyResult {
    return {
      values,
      embeddings,
      usage: {
        tokens: embeddings.flat().length,
      },
      warnings: [],
    }
  }

  it('normalizes input before generating a single embedding', async () => {
    vi.mocked(embed).mockResolvedValue(
      createEmbedResult('hello world', [0.1, 0.2, 0.3]),
    )

    const result = await generateEmbedding('hello\n\nworld  ')

    expect(result).toEqual([0.1, 0.2, 0.3])
    expect(embed).toHaveBeenCalledWith({
      model: `mock-model:${EMBEDDING_CONFIG.model}`,
      value: 'hello world',
    })
  })

  it('returns empty array for empty batch input', async () => {
    const result = await generateEmbeddings([])
    expect(result).toEqual([])
    expect(embedMany).not.toHaveBeenCalled()
  })

  it('normalizes all values and forwards maxParallelCalls in batch mode', async () => {
    vi.mocked(embedMany).mockResolvedValue(
      createEmbedManyResult(
        ['one two', 'three'],
        [
          [1, 2],
          [3, 4],
        ],
      ),
    )

    const result = await generateEmbeddings(['one\n\ntwo', '   three'])

    expect(result).toEqual([
      [1, 2],
      [3, 4],
    ])
    expect(embedMany).toHaveBeenCalledWith({
      model: `mock-model:${EMBEDDING_CONFIG.model}`,
      values: ['one two', 'three'],
      maxParallelCalls: EMBEDDING_CONFIG.maxParallelCalls,
    })
  })
})
