export interface DigestPayload {
  topics: string[]
  connections: string[]
  suggestedQuestions: string[]
}

export interface WeeklyDigestConfig {
  model: string
  maxOutputTokens: number
}

export const WEEKLY_DIGEST_CONFIG = {
  model: 'openai/gpt-4o-mini',
  maxOutputTokens: 512,
} as const satisfies WeeklyDigestConfig

export interface WeeklyDigestRow {
  id: string
  user_id: string
  week_start: string
  topics: string[]
  connections: string[]
  suggested_questions: string[]
  dismissed_at: string | null
  created_at: string
}
