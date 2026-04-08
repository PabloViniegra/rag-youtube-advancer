import { QUICK_PROMPTS_CONFIG } from './types'

export const SYSTEM_PROMPT_QUICK_PROMPTS = `
You are a helpful assistant for a YouTube content creator.
Given a list of video titles, generate exactly ${QUICK_PROMPTS_CONFIG.promptCount} questions in Spanish
that the user could ask their AI search engine to get useful insights from their videos.
Return ONLY a JSON array of strings. No explanation, no markdown fences.
`.trim()

export function buildUserPrompt(titles: string[]): string {
  return `Video titles:\n${titles.map((t) => `- ${t}`).join('\n')}`
}
