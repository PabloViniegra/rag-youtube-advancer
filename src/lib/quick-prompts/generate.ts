import { generateText } from 'ai'
import { unstable_cache } from 'next/cache'
import { aiGateway } from '@/lib/ai/gateway'
import { buildUserPrompt, SYSTEM_PROMPT_QUICK_PROMPTS } from './prompts'
import { FALLBACK_QUESTIONS, QUICK_PROMPTS_CONFIG } from './types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strips markdown code fences if the LLM wraps the JSON despite instructions.
 * Handles ```json ... ``` and ``` ... ``` patterns.
 */
function stripCodeFences(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.startsWith('```')) {
    const withoutOpener = trimmed.replace(/^```(?:json)?\s*\n?/, '')
    return withoutOpener.replace(/\n?```\s*$/, '').trim()
  }
  return trimmed
}

// ─── Core generation ──────────────────────────────────────────────────────────

async function _generateQuickPrompts(titles: string[]): Promise<string[]> {
  if (titles.length === 0) {
    return [...FALLBACK_QUESTIONS]
  }

  try {
    const model = aiGateway(QUICK_PROMPTS_CONFIG.model)

    const result = await generateText({
      model,
      system: SYSTEM_PROMPT_QUICK_PROMPTS,
      prompt: buildUserPrompt(titles),
      maxOutputTokens: QUICK_PROMPTS_CONFIG.maxOutputTokens,
    })

    const cleaned = stripCodeFences(result.text)
    const parsed = JSON.parse(cleaned) as string[]

    const { promptCount } = QUICK_PROMPTS_CONFIG

    if (parsed.length >= promptCount) {
      return parsed.slice(0, promptCount)
    }

    // Pad with fallbacks if fewer than expected
    const fallbacks = FALLBACK_QUESTIONS.filter((q) => !parsed.includes(q))
    return [...parsed, ...fallbacks].slice(0, promptCount)
  } catch (error) {
    console.error('[quick-prompts] Failed to generate prompts:', error)
    return [...FALLBACK_QUESTIONS]
  }
}

export const generateQuickPrompts = unstable_cache(
  _generateQuickPrompts,
  ['quick-prompts'],
  { tags: ['quick-prompts'], revalidate: 3600 },
)

export { QUICK_PROMPTS_CONFIG, FALLBACK_QUESTIONS }
