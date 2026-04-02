import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth Callback Route
 *
 * Supabase redirects here after a successful OAuth sign-in.
 * Exchanges the one-time `code` for a user session and sets the
 * auth cookies via the server Supabase client.
 *
 * URL: /auth/callback?code=<code>&next=/dashboard
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successful sign-in — redirect to intended destination
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong — redirect to error page with reason
  return NextResponse.redirect(
    `${origin}/auth/error?reason=oauth_callback_failed`,
  )
}
