/**
 * Intelligence Report — Parallel Generation
 *
 * Runs 3 concurrent gpt-4o-mini calls via Vercel AI Gateway to produce
 * an {@link IntelligenceReport} from a raw transcript. Each call handles
 * a different slice of the report:
 *
 *   Call 1 → Summary & Structure  (PROMPT_SUMMARY)
 *   Call 2 → Content Repurposing  (PROMPT_REPURPOSE)
 *   Call 3 → Deep Analysis        (PROMPT_ANALYSIS)
 *
 * All calls enforce JSON-only output and are parsed with JSON.parse().
 */

import { generateText } from 'ai'
import { aiGateway } from '@/lib/ai/gateway'
import { PROMPT_ANALYSIS, PROMPT_REPURPOSE, PROMPT_SUMMARY } from './prompts'
import type {
  IntelligenceAnalysis,
  IntelligenceReport,
  IntelligenceRepurpose,
  IntelligenceSummary,
} from './types'
import { INTELLIGENCE_CONFIG } from './types'

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

/**
 * Safely parses the LLM text output into a typed object.
 * Throws a descriptive error if parsing fails.
 */
function parseJsonResponse<T>(raw: string, label: string): T {
  const cleaned = stripCodeFences(raw)
  try {
    return JSON.parse(cleaned) as T
  } catch (error) {
    const preview = cleaned.slice(0, 200)
    throw new Error(
      `Failed to parse ${label} response as JSON: ${String(error)}. Preview: "${preview}"`,
    )
  }
}

// ─── Core generation ──────────────────────────────────────────────────────────

export interface GenerateReportInput {
  /** The full transcript text (all segments concatenated). */
  transcript: string
  /** Optional: the video title for additional context. */
  title?: string
}

/**
 * Generates a full Intelligence Report by running 3 parallel LLM calls.
 *
 * @throws Error if any of the 3 calls fails or returns unparseable JSON.
 */
export async function generateIntelligenceReport(
  input: GenerateReportInput,
): Promise<IntelligenceReport> {
  const { transcript, title } = input

  const userPrompt = title
    ? `TÍTULO DEL VIDEO: ${title}\n\nTRANSCRIPCIÓN COMPLETA:\n${transcript}`
    : `TRANSCRIPCIÓN COMPLETA:\n${transcript}`

  const model = aiGateway(INTELLIGENCE_CONFIG.model)
  const maxOutputTokens = INTELLIGENCE_CONFIG.maxOutputTokens

  // Fire all 3 calls in parallel — no dependencies between them
  const [summaryResult, repurposeResult, analysisResult] = await Promise.all([
    generateText({
      model,
      system: PROMPT_SUMMARY,
      prompt: userPrompt,
      maxOutputTokens,
    }),
    generateText({
      model,
      system: PROMPT_REPURPOSE,
      prompt: userPrompt,
      maxOutputTokens,
    }),
    generateText({
      model,
      system: PROMPT_ANALYSIS,
      prompt: userPrompt,
      maxOutputTokens,
    }),
  ])

  const summary = parseJsonResponse<IntelligenceSummary>(
    summaryResult.text,
    'summary',
  )
  const repurpose = parseJsonResponse<IntelligenceRepurpose>(
    repurposeResult.text,
    'repurpose',
  )
  const analysis = parseJsonResponse<IntelligenceAnalysis>(
    analysisResult.text,
    'analysis',
  )

  return {
    summary,
    repurpose,
    analysis,
    generatedAt: new Date().toISOString(),
  }
}
