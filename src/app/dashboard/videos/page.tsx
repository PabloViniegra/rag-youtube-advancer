import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { VideoCard } from './_components/video-card'
import { VideoEmptyState } from './_components/video-empty-state'

type VideoRow = Database['public']['Tables']['videos']['Row']

export const metadata: Metadata = {
  title: 'Mis videos — Dashboard',
}

export default async function VideosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/dashboard/videos')
  }

  const { data: videos, error } = await supabase
    .from('videos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const videoList = (error || !videos ? [] : videos) as VideoRow[]

  return (
    <div className="flex flex-col gap-8">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">
            Mis videos
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            {videoList.length > 0
              ? `${videoList.length} video${videoList.length === 1 ? '' : 's'} indexado${videoList.length === 1 ? '' : 's'} en tu segundo cerebro`
              : 'Indexa videos de YouTube y conviértelos en conocimiento consultable'}
          </p>
        </div>

        <Link
          href="/dashboard/videos/new"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 font-body text-sm font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-dim active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <AddIcon />
          Añadir video
        </Link>
      </div>

      {/* ── Content ── */}
      {videoList.length === 0 ? (
        <VideoEmptyState />
      ) : (
        <section aria-label="Lista de videos indexados">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videoList.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function AddIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
