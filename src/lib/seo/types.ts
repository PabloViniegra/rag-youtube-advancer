// ── Call 1: SEO Package ──────────────────────────────────────────────────────

export interface SeoTitleVariant {
  variant: 'A' | 'B' | 'C'
  title: string // max 100 chars
  rationale: string // 1 sentence explaining the SEO angle
}

export interface SeoPackage {
  titleVariants: [SeoTitleVariant, SeoTitleVariant, SeoTitleVariant]
  description: string // 500+ chars; first 2 lines must hook without truncation
  tags: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ] // exactly 15 tags
}

// ── Call 2: Show Notes ───────────────────────────────────────────────────────

export interface ShowNotes {
  episodeTitle: string // podcast-style title, max 80 chars
  description: string // 300-500 chars, hooks before the listener clicks
  resources: string[] // tools, books, people, concepts mentioned in the video
  suggestedLinks: string[] // anchor text suggestions (descriptive labels, not real URLs)
}

// ── Call 3: Thumbnail Brief ──────────────────────────────────────────────────

export interface ThumbnailBrief {
  mainElement: string // primary visual subject (person, object, scene)
  textOverlay: string // 3-5 word hook for thumbnail text
  emotionalTone: string // mood: curiosity / urgency / trust / excitement / etc.
  composition: string // layout description for designer or AI image tool
  colorSuggestions: string[] // 3-4 descriptive color names (e.g. "deep navy", "warm orange")
}

// ── Combined Report ──────────────────────────────────────────────────────────

export interface SeoReport {
  seoPackage: SeoPackage
  showNotes: ShowNotes
  thumbnailBrief: ThumbnailBrief
  generatedAt: string // ISO 8601
}

// ── Config ───────────────────────────────────────────────────────────────────

export interface SeoConfig {
  model: string
  maxOutputTokens: number
}

export const SEO_CONFIG = {
  model: 'openai/gpt-4o-mini',
  maxOutputTokens: 2048,
} as const satisfies SeoConfig
