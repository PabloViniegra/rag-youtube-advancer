/**
 * Tests for generateSeoReport
 *
 * Mocks `ai` (generateText) and `@/lib/ai/gateway` (aiGateway)
 * to exercise the parallel-call logic, JSON parsing helpers,
 * and error paths without hitting a real AI provider.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { generateTextMock, aiGatewayMock } = vi.hoisted(() => ({
  generateTextMock: vi.fn(),
  aiGatewayMock: vi.fn().mockReturnValue('fake-model'),
}))

vi.mock('ai', () => ({
  generateText: generateTextMock,
}))

vi.mock('@/lib/ai/gateway', () => ({
  aiGateway: aiGatewayMock,
}))

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { generateSeoReport } from './generate'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SEO_PACKAGE_JSON = JSON.stringify({
  titleVariants: [
    { variant: 'A', title: 'Title A', rationale: 'Rationale A' },
    { variant: 'B', title: 'Title B', rationale: 'Rationale B' },
    { variant: 'C', title: 'Title C', rationale: 'Rationale C' },
  ],
  description: 'A'.repeat(500),
  tags: Array.from({ length: 15 }, (_, i) => `tag${i + 1}`),
})

const SHOW_NOTES_JSON = JSON.stringify({
  episodeTitle: 'Episode title',
  description: 'Show notes description',
  resources: ['Resource 1', 'Resource 2'],
  suggestedLinks: ['Link anchor 1', 'Link anchor 2'],
})

const THUMBNAIL_BRIEF_JSON = JSON.stringify({
  mainElement: 'Person pointing right',
  textOverlay: 'El secreto revelado',
  emotionalTone: 'curiosity',
  composition: 'Subject centered, text at bottom',
  colorSuggestions: ['deep navy', 'warm orange', 'bright white'],
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockThreeCalls(
  seoPackageText: string,
  showNotesText: string,
  thumbnailBriefText: string,
) {
  let call = 0
  generateTextMock.mockImplementation(async () => {
    const texts = [seoPackageText, showNotesText, thumbnailBriefText]
    return { text: texts[call++] ?? '' }
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('generateSeoReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a full SeoReport when all 3 calls succeed', async () => {
    mockThreeCalls(SEO_PACKAGE_JSON, SHOW_NOTES_JSON, THUMBNAIL_BRIEF_JSON)

    const result = await generateSeoReport({ transcript: 'transcript text' })

    expect(result.seoPackage.titleVariants).toHaveLength(3)
    expect(result.showNotes.episodeTitle).toBe('Episode title')
    expect(result.thumbnailBrief.emotionalTone).toBe('curiosity')
    expect(result.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('fires exactly 3 generateText calls in parallel', async () => {
    mockThreeCalls(SEO_PACKAGE_JSON, SHOW_NOTES_JSON, THUMBNAIL_BRIEF_JSON)

    await generateSeoReport({ transcript: 'text' })

    expect(generateTextMock).toHaveBeenCalledTimes(3)
  })

  it('includes the video title in the user prompt when provided', async () => {
    mockThreeCalls(SEO_PACKAGE_JSON, SHOW_NOTES_JSON, THUMBNAIL_BRIEF_JSON)

    await generateSeoReport({ transcript: 'my transcript', title: 'My Video' })

    const firstCall = generateTextMock.mock.calls[0][0] as { prompt: string }
    expect(firstCall.prompt).toContain('My Video')
    expect(firstCall.prompt).toContain('my transcript')
  })

  it('omits the title line when title is not provided', async () => {
    mockThreeCalls(SEO_PACKAGE_JSON, SHOW_NOTES_JSON, THUMBNAIL_BRIEF_JSON)

    await generateSeoReport({ transcript: 'my transcript' })

    const firstCall = generateTextMock.mock.calls[0][0] as { prompt: string }
    expect(firstCall.prompt).not.toContain('TÍTULO DEL VIDEO')
  })

  it('strips markdown code fences before parsing JSON', async () => {
    const fencedSeoPackage = `\`\`\`json\n${SEO_PACKAGE_JSON}\n\`\`\``
    mockThreeCalls(fencedSeoPackage, SHOW_NOTES_JSON, THUMBNAIL_BRIEF_JSON)

    const result = await generateSeoReport({ transcript: 'text' })

    expect(result.seoPackage.titleVariants[0].variant).toBe('A')
  })

  it('throws a descriptive error when JSON is invalid', async () => {
    generateTextMock.mockResolvedValue({ text: 'this is not json' })

    await expect(generateSeoReport({ transcript: 'text' })).rejects.toThrow(
      /Failed to parse seoPackage response as JSON/,
    )
  })
})
