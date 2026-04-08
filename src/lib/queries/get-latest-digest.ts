import { supabaseAdmin } from '@/lib/supabase/admin'
import type { WeeklyDigestRow } from '@/lib/weekly-digest/types'

export async function getLatestDigest(
  userId: string,
): Promise<WeeklyDigestRow | null> {
  const { data, error } = await supabaseAdmin
    .from('weekly_digests')
    .select('*')
    .eq('user_id', userId)
    .is('dismissed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return data as WeeklyDigestRow
}
