import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ViewTransition } from 'react'
import { createClient } from '@/lib/supabase/server'
import { LibraryStatus } from './_components/library-status'
import { SearchOrchestrator } from './_components/search-orchestrator'

/**
 * /dashboard/search
 *
 * Server Component shell:
 *  - Authenticates the user
 *  - Fetches video count for LibraryStatus (no client waterfall)
 *  - Renders static header + LibraryStatus + SearchOrchestrator (client)
 */

export const metadata: Metadata = {
  title: 'Buscar — Dashboard',
}

export default async function SearchPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/dashboard/search')
  }

  const { count } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const videoCount = count ?? 0

  return (
    <ViewTransition
      enter={{
        'nav-forward': 'slide-from-right',
        'nav-back': 'slide-from-left',
        default: 'none',
      }}
      exit={{
        'nav-forward': 'slide-to-left',
        'nav-back': 'slide-to-right',
        default: 'none',
      }}
      default="none"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        {/* ── Page header (static, SSR'd) ── */}
        <div className="flex flex-col gap-1.5 border-b border-outline-variant pb-6">
          <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary">
            Segundo cerebro
          </span>
          <h1 className="font-headline text-3xl font-extrabold leading-tight text-on-surface md:text-4xl">
            Buscar en mis videos
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            Haz una pregunta en lenguaje natural — la IA busca en todos tus
            videos a la vez.
          </p>
        </div>

        {/* ── Library status (SSR'd, no client waterfall) ── */}
        <LibraryStatus videoCount={videoCount} />

        {/* ── Interactive search (client) ── */}
        <SearchOrchestrator />
      </div>
    </ViewTransition>
  )
}
