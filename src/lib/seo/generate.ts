/**
 * SEO Pack — Parallel Generation
 *
 * Runs 3 concurrent gpt-4o-mini calls via Vercel AI Gateway to produce
 * a {@link SeoReport} from a raw transcript. Each call handles
 * a different slice of the report:
 *
 *   Call 1 → SEO Package      (PROMPT_SEO_PACKAGE)
 *   Call 2 → Show Notes       (PROMPT_SHOW_NOTES)
 *   Call 3 → Thumbnail Brief  (PROMPT_THUMBNAIL_BRIEF)
 *
 * All calls enforce JSON-only output and are parsed with JSON.parse().
 */

import { generateText } from 'ai'
import { aiGateway } from '@/lib/ai/gateway'
import {
  PROMPT_SEO_PACKAGE,
  PROMPT_SHOW_NOTES,
  PROMPT_THUMBNAIL_BRIEF,
} from './prompts'
import type { SeoPackage, SeoReport, ShowNotes, ThumbnailBrief } from './types'
import { SEO_CONFIG } from './types'

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

export interface GenerateSeoReportInput {
  /** The full transcript text (all segments concatenated). */
  transcript: string
  /** Optional: the video title for additional context. */
  title?: string
}

/**
 * Generates a full SEO Report by running 3 parallel LLM calls.
 *
 * @throws Error if any of the 3 calls fails or returns unparseable JSON.
 */
export async function generateSeoReport(
  input: GenerateSeoReportInput,
): Promise<SeoReport> {
  const { transcript, title } = input

  const userPrompt = title
    ? `TÍTULO DEL VIDEO: ${title}\n\nTRANSCRIPCIÓN COMPLETA:\n${transcript}`
    : `TRANSCRIPCIÓN COMPLETA:\n${transcript}`

  const model = aiGateway(SEO_CONFIG.model)
  const maxOutputTokens = SEO_CONFIG.maxOutputTokens

  // Fire all 3 calls in parallel — no dependencies between them
  const [seoPackageResult, showNotesResult, thumbnailBriefResult] =
    await Promise.all([
      generateText({
        model,
        system: PROMPT_SEO_PACKAGE,
        prompt: userPrompt,
        maxOutputTokens,
      }),
      generateText({
        model,
        system: PROMPT_SHOW_NOTES,
        prompt: userPrompt,
        maxOutputTokens,
      }),
      generateText({
        model,
        system: PROMPT_THUMBNAIL_BRIEF,
        prompt: userPrompt,
        maxOutputTokens,
      }),
    ])

  const seoPackage = parseJsonResponse<SeoPackage>(
    seoPackageResult.text,
    'seoPackage',
  )
  const showNotes = parseJsonResponse<ShowNotes>(
    showNotesResult.text,
    'showNotes',
  )
  const thumbnailBrief = parseJsonResponse<ThumbnailBrief>(
    thumbnailBriefResult.text,
    'thumbnailBrief',
  )

  return {
    seoPackage,
    showNotes,
    thumbnailBrief,
    generatedAt: new Date().toISOString(),
  }
}
