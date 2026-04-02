/**
 * Phase 6 — RAG Augmentation: inject retrieved context into an LLM prompt
 * and generate a grounded answer.
 *
 * Flow:
 *   1. Build a numbered context block from the top VideoSectionMatches.
 *   2. Construct a system prompt that instructs the LLM to answer only from
 *      the provided context.
 *   3. Call generateText() via Vercel AI Gateway.
 *   4. Return the answer along with the source sections.
 */
import { generateText } from 'ai'
import { aiGateway } from '@/lib/ai/gateway'
import type { VideoSectionMatch } from '@/lib/retrieval/types'
import type { AugmentationInput, AugmentationResult } from './types'
import { AUGMENTATION_CONFIG } from './types'

// ─── Prompt construction ──────────────────────────────────────────────────────

const SYSTEM_INSTRUCTIONS = `You are a helpful assistant that answers questions strictly based on the provided video transcript excerpts.
Rules:
- Answer only using the information present in the CONTEXT sections below.
- If the context does not contain enough information to answer, say so clearly.
- Be concise and factual.
- Do not invent information or draw on outside knowledge.`

/**
 * Builds a numbered context block from an array of matched video sections.
 * Each entry is prefixed with its 1-based index and similarity score.
 */
function buildContextBlock(matches: VideoSectionMatch[]): string {
  return matches
    .map(
      (m, i) =>
        `[${i + 1}] (similarity: ${m.similarity.toFixed(3)})\n${m.content}`,
    )
    .join('\n\n')
}

/**
 * Constructs the full user message that combines the context block
 * with the user's original query.
 */
function buildUserMessage(query: string, contextBlock: string): string {
  return `CONTEXT:\n${contextBlock}\n\nQUESTION: ${query}`
}

// ─── Core augmentation function ───────────────────────────────────────────────

/**
 * Generates a grounded LLM answer from retrieved video sections.
 *
 * @param input - `{ query, matches }` from the retrieval phase.
 * @returns      `{ answer, sources, sourceCount }`.
 * @throws       Error if the LLM call fails.
 */
export async function augmentAnswer(
  input: AugmentationInput,
): Promise<AugmentationResult> {
  const { query, matches } = input

  const contextBlock = buildContextBlock(matches)
  const userMessage = buildUserMessage(query, contextBlock)

  const { text } = await generateText({
    model: aiGateway(AUGMENTATION_CONFIG.model),
    system: SYSTEM_INSTRUCTIONS,
    prompt: userMessage,
    maxOutputTokens: AUGMENTATION_CONFIG.maxOutputTokens,
  })

  return {
    answer: text,
    sources: matches,
    sourceCount: matches.length,
  }
}
