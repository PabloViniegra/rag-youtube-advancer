'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'

/**
 * Returns the absolute origin URL for the current request.
 * Used to build the OAuth redirect_to callback URL.
 */
async function getOrigin(): Promise<string> {
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

// ---------------------------------------------------------------------------
// Google OAuth
// ---------------------------------------------------------------------------
export async function signInWithGoogle(redirectTo?: string) {
  const supabase = await createClient()
  const origin = await getOrigin()

  const callbackUrl = new URL('/auth/callback', origin)
  if (redirectTo) callbackUrl.searchParams.set('next', redirectTo)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    redirect(`/auth/error?reason=oauth_callback_failed`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

// ---------------------------------------------------------------------------
// GitHub OAuth
// ---------------------------------------------------------------------------
export async function signInWithGithub(redirectTo?: string) {
  const supabase = await createClient()
  const origin = await getOrigin()

  const callbackUrl = new URL('/auth/callback', origin)
  if (redirectTo) callbackUrl.searchParams.set('next', redirectTo)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: callbackUrl.toString(),
    },
  })

  if (error) {
    redirect(`/auth/error?reason=oauth_callback_failed`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

// ---------------------------------------------------------------------------
// Sign Out
// ---------------------------------------------------------------------------
export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    logger.error('auth', 'signOut failed:', error)
  }
  redirect('/')
}

// ---------------------------------------------------------------------------
// Get current session user (Server Component helper)
// ---------------------------------------------------------------------------
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null
  return user
}
