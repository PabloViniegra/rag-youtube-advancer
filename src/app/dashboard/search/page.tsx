import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense, ViewTransition } from 'react'
import { createClient } from '@/lib/supabase/server'
import { LibraryStatus } from './_components/library-status'
import { QuickPrompts } from './_components/quick-prompts'
import { QuickPromptsSkeleton } from './_components/quick-prompts-skeleton'
import { SearchOrchestrator } from './_components/search-orchestrator'

/**
 * /dashboard/search
 *
 * Server Component shell:
 *  - Authenticates the user
 *  - Fetches video count for LibraryStatus (no client waterfall)
 *  - Fetches last 8 video titles for AI quick-prompts
 *  - Renders static header + LibraryStatus + SearchOrchestrator (client)
 *    with QuickPrompts streamed in via Suspense as children
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

  const [countResult, titlesResult] = await Promise.all([
    supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('videos')
      .select('title')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const videoCount = countResult.count ?? 0
  const titles = (titlesResult.data ?? [])
    .map((v) => v.title)
    .filter((t): t is string => typeof t === 'string' && t.length > 0)

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

        {/* ── Interactive search (client) with AI prompts streamed in ── */}
        <SearchOrchestrator>
          <Suspense fallback={<QuickPromptsSkeleton />}>
            <QuickPrompts titles={titles} />
          </Suspense>
        </SearchOrchestrator>
      </div>
    </ViewTransition>
  )
}
