// ─────────────────────────────────────────────────────────────────────────────
// Intelligence Report — Domain Types
//
// Shapes returned by the 3 parallel gpt-4o-mini calls. Each type mirrors the
// exact JSON structure mandated by the corresponding system prompt.
// ─────────────────────────────────────────────────────────────────────────────

// ── Call 1: Summary & Structure ──────────────────────────────────────────────

export interface IntelligenceTldr {
  /** 2-3 sentences: what is this video about */
  context: string
  /** 2-3 sentences: the core thesis/argument */
  mainArgument: string
  /** 2-3 sentences: the takeaway */
  conclusion: string
}

export interface IntelligenceTimestamp {
  /** Estimated time in MM:SS format (e.g. "02:15") */
  time: string
  /** Chapter title — editorial, curiosity-driven */
  label: string
}

export interface IntelligenceSummary {
  tldr: IntelligenceTldr
  timestamps: IntelligenceTimestamp[]
  /** Exactly 5 actionable bullet points */
  keyTakeaways: [string, string, string, string, string]
}

// ── Call 2: Content Repurposing ──────────────────────────────────────────────

export interface TweetEntry {
  /** Position in the thread (1-7) */
  position: number
  /** Tweet text, max 280 characters */
  content: string
}

export interface ShortScript {
  /** Attention grabber, 1-2 sentences */
  hook: string
  /** Main content, 3-4 sentences */
  body: string
  /** Call to action, 1 sentence */
  cta: string
  /** Description of the most viral moment */
  suggestedClip: string
}

export interface NewsletterDraft {
  /** Email subject line, max 60 characters */
  subject: string
  /** 3-4 paragraphs, conversational tone */
  body: string
}

export interface IntelligenceRepurpose {
  /** Thread of exactly 7 tweets */
  twitterThread: [
    TweetEntry,
    TweetEntry,
    TweetEntry,
    TweetEntry,
    TweetEntry,
    TweetEntry,
    TweetEntry,
  ]
  shortScript: ShortScript
  /** Max 1300 characters, professional tone */
  linkedinPost: string
  newsletterDraft: NewsletterDraft
}

// ── Call 3: Deep Analysis ───────────────────────────────────────────────────

export const SENTIMENT_TONES = [
  'optimista',
  'critico',
  'educativo',
  'polemico',
  'inspiracional',
  'tecnico',
  'conversacional',
] as const

export type SentimentTone = (typeof SENTIMENT_TONES)[number]

export const ENTITY_TYPES = [
  'persona',
  'marca',
  'herramienta',
  'libro',
  'concepto',
] as const

export type EntityType = (typeof ENTITY_TYPES)[number]

export interface SentimentAnalysis {
  tone: SentimentTone
  /** Confidence score 0-1 */
  confidence: number
  /** 1-2 sentences explaining the classification */
  explanation: string
}

export interface EntityMention {
  name: string
  type: EntityType
  /** 1 sentence about how it's mentioned in this video */
  context: string
}

export interface IntelligenceAnalysis {
  sentiment: SentimentAnalysis
  /** 3-15 entities sorted by relevance */
  entities: EntityMention[]
  /** Exactly 3 smart, non-obvious questions */
  suggestedQuestions: [string, string, string]
}

// ── Combined Report ─────────────────────────────────────────────────────────

/**
 * The full Intelligence Report, composed from the 3 parallel LLM calls.
 * Stored as JSONB in the `intelligence_reports` table alongside the video.
 */
export interface IntelligenceReport {
  summary: IntelligenceSummary
  repurpose: IntelligenceRepurpose
  analysis: IntelligenceAnalysis
  /** ISO 8601 timestamp of when the report was generated */
  generatedAt: string
}

// ── Config ───────────────────────────────────────────────────────────────────

export interface IntelligenceConfig {
  model: string
  maxOutputTokens: number
}

export const INTELLIGENCE_CONFIG = {
  model: 'openai/gpt-4o-mini',
  maxOutputTokens: 2048,
} as const satisfies IntelligenceConfig
