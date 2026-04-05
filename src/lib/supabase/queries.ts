import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Count the number of videos owned by a specific user.
 * Uses `count: 'exact'` with `head: true` to avoid transferring row data.
 */
export async function getVideoCount(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to count videos: ${error.message}`)
  }

  return count ?? 0
}
