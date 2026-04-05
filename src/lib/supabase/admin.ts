import { createClient } from '@supabase/supabase-js'
import { supabaseServiceRoleKey, supabaseUrl } from '@/lib/env'
import type { Database } from './types'

/**
 * Supabase admin client — uses the service_role key to bypass RLS.
 *
 * ONLY use this in trusted server contexts (webhooks, background jobs)
 * where the user's auth cookie is not available or RLS must be skipped.
 */
function createAdminClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// Persist across hot reloads in dev
const globalForAdmin = globalThis as unknown as {
  __supabaseAdmin?: ReturnType<typeof createAdminClient>
}

export const supabaseAdmin =
  globalForAdmin.__supabaseAdmin ?? createAdminClient()

if (process.env.NODE_ENV !== 'production') {
  globalForAdmin.__supabaseAdmin = supabaseAdmin
}
