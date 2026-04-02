/**
 * Phase 4 — RAG Storage: persist a video and its embedded sections.
 *
 * Flow:
 *   1. Upsert `videos` row (youtube_id + user_id as the unique key).
 *   2. Delete all existing `video_sections` for that video (idempotent re-ingestion).
 *   3. Bulk-insert all `video_sections` rows (content + embedding vector).
 *
 * Accepts a Supabase client instance so callers control auth context and
 * the function remains pure / testable without network calls.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { StoreVideoInput, StoreVideoResult } from './types'

// ─── Type aliases ─────────────────────────────────────────────────────────────

type AppSupabaseClient = SupabaseClient<Database>

type VideoRow = Database['public']['Tables']['videos']['Row']

type VideoSectionInsert =
  Database['public']['Tables']['video_sections']['Insert']

// ─── Core storage function ────────────────────────────────────────────────────

/**
 * Stores a video and its embedded sections in Supabase.
 *
 * @param supabase - Authenticated Supabase server client.
 * @param input    - Video metadata + EmbeddedChunks to persist.
 * @returns        Promise resolving to `{ videoId, count }`.
 * @throws         Error with a descriptive message on any DB failure.
 */
export async function storeVideoSections(
  supabase: AppSupabaseClient,
  input: StoreVideoInput,
): Promise<StoreVideoResult> {
  const { youtubeId, title, userId, sections } = input

  // Step 1 — upsert the video row (idempotent by youtube_id + user_id)
  // Cast needed: supabase-js v2 resolves Insert type as `never` for tables
  // that use generated types with vector columns — safe because the shape
  // matches the DB schema exactly.
  const { data: upsertData, error: videoError } = await (
    supabase.from('videos') as ReturnType<AppSupabaseClient['from']>
  )
    .upsert({ youtube_id: youtubeId, title, user_id: userId } as VideoRow, {
      onConflict: 'youtube_id,user_id',
      ignoreDuplicates: false,
    })
    .select('id')
    .single()

  if (videoError || !upsertData) {
    throw new Error(
      `Failed to upsert video: ${videoError?.message ?? 'no data returned'}`,
    )
  }

  const videoId = (upsertData as Pick<VideoRow, 'id'>).id

  // Step 2 — delete existing sections (allow clean re-ingestion)
  const { error: deleteError } = await supabase
    .from('video_sections')
    .delete()
    .eq('video_id', videoId)

  if (deleteError) {
    throw new Error(
      `Failed to delete existing sections: ${deleteError.message}`,
    )
  }

  // Step 3 — bulk insert new sections (handle empty sections array gracefully)
  if (sections.length === 0) {
    return { videoId, count: 0 }
  }

  const rows: VideoSectionInsert[] = sections.map((s) => ({
    video_id: videoId,
    content: s.content,
    embedding: s.embedding,
  }))

  const { error: insertError } = await (
    supabase.from('video_sections') as ReturnType<AppSupabaseClient['from']>
  ).insert(rows as VideoRow[])

  if (insertError) {
    throw new Error(`Failed to insert video sections: ${insertError.message}`)
  }

  return { videoId, count: sections.length }
}
