import { generateText } from 'ai'
import { aiGateway } from '@/lib/ai/gateway'
import {
  buildWeeklyDigestUserPrompt,
  SYSTEM_PROMPT_WEEKLY_DIGEST,
} from './prompts'
import type { DigestPayload } from './types'
import { WEEKLY_DIGEST_CONFIG } from './types'

function stripCodeFences(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.startsWith('```')) {
    const withoutOpener = trimmed.replace(/^```(?:json)?\s*\n?/, '')
    return withoutOpener.replace(/\n?```\s*$/, '').trim()
  }
  return trimmed
}

export async function generateWeeklyDigest(
  titles: string[],
): Promise<DigestPayload> {
  const { text } = await generateText({
    model: aiGateway(WEEKLY_DIGEST_CONFIG.model),
    maxOutputTokens: WEEKLY_DIGEST_CONFIG.maxOutputTokens,
    system: SYSTEM_PROMPT_WEEKLY_DIGEST,
    prompt: buildWeeklyDigestUserPrompt(titles),
  })

  const cleaned = stripCodeFences(text)
  const parsed = JSON.parse(cleaned) as Record<string, unknown>

  return {
    topics: Array.isArray(parsed.topics) ? (parsed.topics as string[]) : [],
    connections: Array.isArray(parsed.connections)
      ? (parsed.connections as string[])
      : [],
    suggestedQuestions: Array.isArray(parsed.suggestedQuestions)
      ? (parsed.suggestedQuestions as string[])
      : [],
  }
}
