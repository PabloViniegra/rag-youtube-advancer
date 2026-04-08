'use server'

import { updateTag } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function dismissDigest(digestId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  await supabaseAdmin
    .from('weekly_digests')
    .update({ dismissed_at: new Date().toISOString() })
    .eq('id', digestId)
    .eq('user_id', user.id)

  updateTag(`dashboard-${user.id}`)
}
