/**
 * Tests for generateIntelligenceReport
 *
 * Validates JSON parsing behavior and retry strategy when one of the
 * parallel calls returns malformed JSON on the first attempt.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

import { generateIntelligenceReport } from './generate'

const SUMMARY_JSON = JSON.stringify({
  tldr: {
    context: 'Contexto',
    mainArgument: 'Argumento',
    conclusion: 'Conclusion',
  },
  timestamps: [{ time: '00:00', label: 'Inicio' }],
  keyTakeaways: ['a', 'b', 'c', 'd', 'e'],
})

const ANALYSIS_JSON = JSON.stringify({
  sentiment: {
    tone: 'educativo',
    confidence: 0.9,
    explanation: 'Explicacion',
  },
  entities: [{ name: 'OpenAI', type: 'marca', context: 'Se menciona.' }],
  suggestedQuestions: ['q1', 'q2', 'q3'],
})

const REPURPOSE_INVALID_JSON = `
{
  "twitterThread": [
    { "position": 1, "content": "Tweet 1" },
    { "position" "content": "Tweet roto" }
  ],
  "shortScript": {
    "hook": "Hook",
    "body": "Body",
    "cta": "CTA",
    "suggestedClip": "Clip"
  },
  "linkedinPost": "Post",
  "newsletterDraft": {
    "subject": "Asunto",
    "body": "Cuerpo"
  }
}`

const REPURPOSE_VALID_JSON = JSON.stringify({
  twitterThread: [
    { position: 1, content: '1' },
    { position: 2, content: '2' },
    { position: 3, content: '3' },
    { position: 4, content: '4' },
    { position: 5, content: '5' },
    { position: 6, content: '6' },
    { position: 7, content: '7' },
  ],
  shortScript: {
    hook: 'Hook',
    body: 'Body',
    cta: 'CTA',
    suggestedClip: 'Clip',
  },
  linkedinPost: 'Post',
  newsletterDraft: {
    subject: 'Asunto',
    body: 'Cuerpo',
  },
})

function setupRetryScenario() {
  let repurposeAttempt = 0

  generateTextMock.mockImplementation(
    async (args: { system: string }): Promise<{ text: string }> => {
      if (args.system.includes('estratega de contenido de élite')) {
        repurposeAttempt += 1
        return {
          text:
            repurposeAttempt === 1
              ? REPURPOSE_INVALID_JSON
              : REPURPOSE_VALID_JSON,
        }
      }

      if (args.system.includes('analista editorial senior')) {
        return { text: SUMMARY_JSON }
      }

      return { text: ANALYSIS_JSON }
    },
  )
}

describe('generateIntelligenceReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('retries once when repurpose JSON is malformed and then succeeds', async () => {
    setupRetryScenario()

    const result = await generateIntelligenceReport({
      transcript: 'transcripcion de prueba',
      title: 'Video de prueba',
    })

    expect(result.repurpose.twitterThread).toHaveLength(7)
    expect(result.repurpose.shortScript.hook).toBe('Hook')
    expect(result.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(generateTextMock).toHaveBeenCalledTimes(4)
  })
})
