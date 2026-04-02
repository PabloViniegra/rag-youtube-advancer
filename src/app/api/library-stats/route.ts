/**
 * GET /api/library-stats
 *
 * Returns the number of indexed videos for the authenticated user.
 * Used by the search page to show library status before a search is attempted.
 *
 * Success (200):
 *   { videoCount: number }
 *
 * Unauthenticated users receive { videoCount: 0 } (not an error — the search
 * page handles auth separately; this endpoint is best-effort context).
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface LibraryStatsResponse {
  videoCount: number
}

export async function GET(): Promise<NextResponse<LibraryStatsResponse>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ videoCount: 0 })
  }

  const { count } = await supabase
    .from('videos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return NextResponse.json({ videoCount: count ?? 0 })
}
