/**
 * Unit tests for augmentAnswer (Phase 6 — Augmentation).
 *
 * `generateText` from the `ai` SDK and `aiGateway` are mocked so no real
 * network calls are made.
 *
 * Coverage:
 *   - Returns answer + sources + sourceCount on success
 *   - Calls generateText with the correct model
 *   - Builds context block with similarity scores and indices
 *   - Builds user message containing the query and CONTEXT header
 *   - Uses maxOutputTokens from AUGMENTATION_CONFIG
 *   - Passes system instructions to generateText
 *   - Handles single match correctly
 *   - Throws when generateText rejects
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { VideoSectionMatch } from '@/lib/retrieval/types'
import { augmentAnswer } from './augment'
import type { AugmentationInput } from './types'
import { AUGMENTATION_CONFIG } from './types'

// ─── Hoisted constants ────────────────────────────────────────────────────────

const { FAKE_MODEL } = vi.hoisted(() => ({
  FAKE_MODEL: { __brand: 'FakeModel' } as const,
}))

// ─── Mock ai SDK ──────────────────────────────────────────────────────────────

vi.mock('ai', () => ({
  generateText: vi.fn(),
}))

// ─── Mock aiGateway ───────────────────────────────────────────────────────────

vi.mock('@/lib/ai/gateway', () => ({
  aiGateway: vi.fn().mockReturnValue(FAKE_MODEL),
}))

// ─── Imports for mocked modules ───────────────────────────────────────────────

import { generateText } from 'ai'
import { aiGateway } from '@/lib/ai/gateway'

const mockGenerateText = vi.mocked(generateText)
const mockAiGateway = vi.mocked(aiGateway)

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MATCHES: VideoSectionMatch[] = [
  {
    id: 'sec-1',
    videoId: 'vid-1',
    content: 'React hooks simplify state management.',
    similarity: 0.93,
  },
  {
    id: 'sec-2',
    videoId: 'vid-1',
    content: 'useEffect runs after every render by default.',
    similarity: 0.87,
  },
]

function buildInput(overrides?: Partial<AugmentationInput>): AugmentationInput {
  return {
    query: 'What are React hooks?',
    matches: MATCHES,
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('augmentAnswer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGenerateText.mockResolvedValue({
      text: 'React hooks are functions.',
      // biome-ignore lint/suspicious/noExplicitAny: mock return value
    } as any)
    mockAiGateway.mockReturnValue(FAKE_MODEL as never)
  })

  // ── Happy path ────────────────────────────────────────────────────────────

  it('returns answer, sources and sourceCount on success', async () => {
    const result = await augmentAnswer(buildInput())

    expect(result.answer).toBe('React hooks are functions.')
    expect(result.sources).toEqual(MATCHES)
    expect(result.sourceCount).toBe(2)
  })

  it('calls aiGateway with the configured model id', async () => {
    await augmentAnswer(buildInput())

    expect(mockAiGateway).toHaveBeenCalledWith(AUGMENTATION_CONFIG.model)
  })

  it('passes the gateway model to generateText', async () => {
    await augmentAnswer(buildInput())

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({ model: FAKE_MODEL }),
    )
  })

  it('includes maxOutputTokens from AUGMENTATION_CONFIG in generateText call', async () => {
    await augmentAnswer(buildInput())

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        maxOutputTokens: AUGMENTATION_CONFIG.maxOutputTokens,
      }),
    )
  })

  it('passes system instructions to generateText', async () => {
    await augmentAnswer(buildInput())

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining(
          'strictly based on the provided video transcript',
        ),
      }),
    )
  })

  it('builds context block with 1-based index and similarity for each match', async () => {
    await augmentAnswer(buildInput())

    const callArg = mockGenerateText.mock.calls[0][0]
    const prompt = (callArg as { prompt: string }).prompt

    expect(prompt).toContain('[1]')
    expect(prompt).toContain('[2]')
    expect(prompt).toContain('0.930')
    expect(prompt).toContain('0.870')
    expect(prompt).toContain('React hooks simplify state management.')
  })

  it('includes the query after the QUESTION label in the user message', async () => {
    const query = 'What are React hooks?'
    await augmentAnswer(buildInput({ query }))

    const callArg = mockGenerateText.mock.calls[0][0]
    const prompt = (callArg as { prompt: string }).prompt

    expect(prompt).toContain(`QUESTION: ${query}`)
  })

  it('works correctly with a single match', async () => {
    const single: AugmentationInput = {
      query: 'Any question?',
      matches: [MATCHES[0]],
    }

    const result = await augmentAnswer(single)

    expect(result.sourceCount).toBe(1)
    expect(result.sources).toHaveLength(1)
  })

  // ── Error propagation ─────────────────────────────────────────────────────

  it('throws when generateText rejects', async () => {
    mockGenerateText.mockRejectedValue(new Error('LLM gateway timeout'))

    await expect(augmentAnswer(buildInput())).rejects.toThrow(
      'LLM gateway timeout',
    )
  })
})
