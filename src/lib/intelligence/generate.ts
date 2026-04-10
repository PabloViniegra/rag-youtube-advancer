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

const STRUCTURED_OUTPUT_RETRY_COUNT = 1

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

interface GenerateStructuredSectionInput {
  model: ReturnType<typeof aiGateway>
  system: string
  prompt: string
  maxOutputTokens: number
  label: string
}

async function generateStructuredSection<T>(
  input: GenerateStructuredSectionInput,
): Promise<T> {
  let lastError: unknown

  for (
    let attempt = 0;
    attempt <= STRUCTURED_OUTPUT_RETRY_COUNT;
    attempt += 1
  ) {
    const result = await generateText({
      model: input.model,
      system: input.system,
      prompt: input.prompt,
      maxOutputTokens: input.maxOutputTokens,
      temperature: 0,
    })

    try {
      return parseJsonResponse<T>(result.text, input.label)
    } catch (error) {
      lastError = error
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : String(lastError)

  throw new Error(
    `Failed to generate ${input.label} as valid JSON after ${STRUCTURED_OUTPUT_RETRY_COUNT + 1} attempts. ${message}`,
  )
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

  // Fire all 3 calls in parallel — each call retries once if JSON is malformed.
  const [summary, repurpose, analysis] = await Promise.all([
    generateStructuredSection<IntelligenceSummary>({
      model,
      system: PROMPT_SUMMARY,
      prompt: userPrompt,
      maxOutputTokens,
      label: 'summary',
    }),
    generateStructuredSection<IntelligenceRepurpose>({
      model,
      system: PROMPT_REPURPOSE,
      prompt: userPrompt,
      maxOutputTokens,
      label: 'repurpose',
    }),
    generateStructuredSection<IntelligenceAnalysis>({
      model,
      system: PROMPT_ANALYSIS,
      prompt: userPrompt,
      maxOutputTokens,
      label: 'analysis',
    }),
  ])

  return {
    summary,
    repurpose,
    analysis,
    generatedAt: new Date().toISOString(),
  }
}
