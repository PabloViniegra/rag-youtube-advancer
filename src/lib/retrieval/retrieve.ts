/**
 * Phase 5 — RAG Retrieval: embed a user query and perform cosine similarity
 * search against stored video_sections via the `match_video_sections` RPC.
 *
 * Flow:
 *   1. Embed the raw query text via Vercel AI Gateway (reuses Phase 3 embed).
 *   2. Call the `match_video_sections` Postgres RPC with the query vector.
 *   3. Map snake_case DB rows to camelCase `VideoSectionMatch` objects.
 *
 * Accepts a Supabase client instance so callers control auth context and
 * the function remains pure / testable without network calls.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { generateEmbedding } from '@/lib/ai/embed'
import type { Database } from '@/lib/supabase/types'
import type {
  RetrievalInput,
  RetrievalResult,
  VideoSectionMatch,
} from './types'

// ─── Type aliases ─────────────────────────────────────────────────────────────

type AppSupabaseClient = SupabaseClient<Database>

type MatchRow =
  Database['public']['Functions']['match_video_sections']['Returns'][number]

// supabase-js v2 resolves RPC arg types as `undefined` for functions that
// involve vector columns — the cast below bypasses the broken inference while
// keeping the call shape correct against the DB schema.
type AnyRpc = ReturnType<AppSupabaseClient['rpc']>

// ─── Core retrieval function ──────────────────────────────────────────────────

/**
 * Retrieves the most semantically similar video sections for a given query.
 *
 * @param supabase - Authenticated Supabase server client.
 * @param input    - Query text, user ID, similarity threshold, and match count.
 * @returns        Promise resolving to `{ matches, count }`.
 * @throws         Error with a descriptive message on embedding or DB failure.
 */
export async function retrieveSections(
  supabase: AppSupabaseClient,
  input: RetrievalInput,
): Promise<RetrievalResult> {
  const { query, userId, matchThreshold, matchCount } = input

  // Step 1 — embed the query using the same model as Phase 3
  const queryEmbedding = await generateEmbedding(query)

  // Step 2 — call the match_video_sections RPC (cosine similarity search)
  // Cast needed: supabase-js v2 resolves RPC args as `undefined` for RPCs
  // that reference vector columns — safe because the shape matches the DB
  // function signature exactly.
  // Cast needed: supabase-js v2 resolves RPC arg types as `undefined` for
  // RPCs involving vector columns — double-cast via `unknown` to satisfy TS
  // while keeping the call shape correct against the DB function signature.
  const rpcArgs = {
    query_embedding: queryEmbedding,
    user_id: userId,
    match_threshold: matchThreshold,
    match_count: matchCount,
  } as unknown as undefined

  const { data, error } = await (supabase.rpc(
    'match_video_sections',
    rpcArgs,
  ) as AnyRpc)

  if (error) {
    throw new Error(`match_video_sections RPC failed: ${error.message}`)
  }

  // Step 3 — map snake_case rows to camelCase domain objects
  const rows = (data ?? []) as MatchRow[]
  const matches: VideoSectionMatch[] = rows.map((row) => ({
    id: row.id,
    videoId: row.video_id,
    content: row.content,
    similarity: row.similarity,
  }))

  return { matches, count: matches.length }
}
