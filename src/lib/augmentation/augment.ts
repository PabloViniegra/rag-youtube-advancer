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
import { generateText, streamText } from 'ai'
import { aiGateway } from '@/lib/ai/gateway'
import type { VideoSectionMatch } from '@/lib/retrieval/types'
import type {
  AugmentationInput,
  AugmentationResult,
  AugmentStreamChunk,
} from './types'
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

  let text: string
  try {
    const result = await generateText({
      model: aiGateway(AUGMENTATION_CONFIG.model),
      system: SYSTEM_INSTRUCTIONS,
      prompt: userMessage,
      maxOutputTokens: AUGMENTATION_CONFIG.maxOutputTokens,
    })
    text = result.text
  } catch (error) {
    throw new Error(
      `LLM augmentation failed: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    )
  }

  return {
    answer: text,
    sources: matches,
    sourceCount: matches.length,
  }
}

// ─── Streaming augmentation ───────────────────────────────────────────────────

const RELATED_QUERIES_INSTRUCTION = `\n\nAfter your answer, output exactly this JSON on a new line: <related>["q1","q2","q3"]</related>
where q1, q2, q3 are 3 concise follow-up questions in the same language as the QUESTION.`

const RELATED_REGEX = /<related>(\[[\s\S]*?\])<\/related>/

/**
 * Streaming variant of `augmentAnswer`.
 *
 * Emits an `AsyncIterable<AugmentStreamChunk>`:
 *   1. One `sources` chunk with all retrieved sections.
 *   2. Many `token` chunks — one per LLM text delta.
 *   3. One `done` chunk with extracted `relatedQueries`.
 *
 * The `<related>…</related>` block appended by the system prompt is stripped
 * from the visible answer before the `done` chunk is emitted.
 *
 * @param input - `{ query, matches }` from the retrieval phase.
 * @returns      An async iterable of typed stream chunks.
 * @throws       Error if the LLM stream fails.
 */
export async function* augmentAnswerStream(
  input: AugmentationInput,
): AsyncIterable<AugmentStreamChunk> {
  const { query, matches } = input

  // Emit sources up-front so the client can render them immediately
  yield { type: 'sources', payload: matches }

  const contextBlock = buildContextBlock(matches)
  const userMessage = buildUserMessage(query, contextBlock)

  let result
  try {
    result = streamText({
      model: aiGateway(AUGMENTATION_CONFIG.model),
      system: SYSTEM_INSTRUCTIONS + RELATED_QUERIES_INSTRUCTION,
      prompt: userMessage,
      maxOutputTokens: AUGMENTATION_CONFIG.maxOutputTokens,
    })
  } catch (error) {
    throw new Error(
      `LLM stream initialisation failed: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    )
  }

  // Buffer the full text so we can strip the <related> block at the end
  let fullText = ''

  try {
    for await (const chunk of result.fullStream) {
      if (chunk.type === 'text-delta') {
        fullText += chunk.text
        yield { type: 'token', payload: chunk.text }
      }
    }
  } catch (error) {
    throw new Error(
      `LLM stream failed mid-generation: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    )
  }

  // Extract and parse <related> queries; strip from visible answer
  const match = RELATED_REGEX.exec(fullText)
  let relatedQueries: string[] = []

  if (match) {
    try {
      const parsed: unknown = JSON.parse(match[1])
      if (
        Array.isArray(parsed) &&
        parsed.every((q): q is string => typeof q === 'string')
      ) {
        relatedQueries = parsed
      }
    } catch {
      // Malformed JSON — emit empty related queries rather than crashing
    }
  }

  yield { type: 'done', relatedQueries }
}
