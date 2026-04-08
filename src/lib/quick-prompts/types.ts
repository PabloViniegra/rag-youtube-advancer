export interface QuickPromptsConfig {
  model: string
  maxOutputTokens: number
  promptCount: number
  titleLimit: number
}

export const QUICK_PROMPTS_CONFIG = {
  model: 'openai/gpt-4o-mini',
  maxOutputTokens: 256,
  promptCount: 4,
  titleLimit: 8,
} as const satisfies QuickPromptsConfig

export const FALLBACK_QUESTIONS: readonly string[] = [
  '¿Qué técnicas de retención mencionan mis videos?',
  '¿Cuáles son los temas recurrentes en mi biblioteca?',
  '¿Qué consejos prácticos aparecen más en mis videos?',
]
