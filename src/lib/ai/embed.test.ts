import { type EmbedManyResult, type EmbedResult, embed, embedMany } from 'ai'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { embedChunks, generateEmbedding, generateEmbeddings } from './embed'
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

// ─── helpers ─────────────────────────────────────────────────────────────────

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

// ─── generateEmbedding ───────────────────────────────────────────────────────

describe('generateEmbedding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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
})

// ─── generateEmbeddings ──────────────────────────────────────────────────────

describe('generateEmbeddings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

// ─── embedChunks ─────────────────────────────────────────────────────────────

describe('embedChunks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array for empty input', async () => {
    const result = await embedChunks([])
    expect(result).toEqual([])
    expect(embedMany).not.toHaveBeenCalled()
  })

  it('embeds chunks and preserves index ordering', async () => {
    vi.mocked(embedMany).mockResolvedValue(
      createEmbedManyResult(
        ['first chunk', 'second chunk'],
        [
          [0.1, 0.2],
          [0.3, 0.4],
        ],
      ),
    )

    const result = await embedChunks(['first chunk', 'second chunk'])

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      content: 'first chunk',
      index: 0,
      embedding: [0.1, 0.2],
    })
    expect(result[1]).toEqual({
      content: 'second chunk',
      index: 1,
      embedding: [0.3, 0.4],
    })
  })

  it('processes chunks in batches and re-assembles with correct indices', async () => {
    // Simulate three chunks with batchSize=2 → two gateway calls
    vi.mocked(embedMany)
      .mockResolvedValueOnce(
        createEmbedManyResult(
          ['chunk A', 'chunk B'],
          [
            [1, 0],
            [0, 1],
          ],
        ),
      )
      .mockResolvedValueOnce(createEmbedManyResult(['chunk C'], [[0.5, 0.5]]))

    const result = await embedChunks(['chunk A', 'chunk B', 'chunk C'], 2)

    expect(embedMany).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(3)
    expect(result[0]).toMatchObject({ content: 'chunk A', index: 0 })
    expect(result[1]).toMatchObject({ content: 'chunk B', index: 1 })
    expect(result[2]).toMatchObject({ content: 'chunk C', index: 2 })
  })

  it('single chunk uses embedMany under the hood (via generateEmbeddings)', async () => {
    vi.mocked(embedMany).mockResolvedValue(
      createEmbedManyResult(['only chunk'], [[0.9, 0.1]]),
    )

    const result = await embedChunks(['only chunk'])

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      content: 'only chunk',
      index: 0,
      embedding: [0.9, 0.1],
    })
  })
})
