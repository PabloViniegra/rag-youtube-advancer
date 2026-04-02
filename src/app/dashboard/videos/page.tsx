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
  const count = videoList.length

  return (
    <div className="flex flex-col gap-8">
      {/* ── Page header — editorial bold treatment ── */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant pb-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          {/* Overline */}
          <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary">
            Segundo cerebro
          </span>
          {/* Display headline */}
          <h1 className="font-headline text-3xl font-extrabold leading-tight text-on-surface md:text-4xl">
            Mis videos
          </h1>
          {/* Subline — data as copy */}
          <p className="font-body text-sm text-on-surface-variant">
            {count > 0
              ? `${count} video${count === 1 ? '' : 's'} indexado${count === 1 ? '' : 's'} en tu base de conocimiento`
              : 'Indexa videos de YouTube y conviértelos en conocimiento consultable'}
          </p>
        </div>

        <Link
          href="/dashboard/videos/new"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-body text-sm font-bold text-on-primary shadow-sm transition-all hover:bg-primary-dim active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <PlusIcon />
          Añadir video
        </Link>
      </div>

      {/* ── Content ── */}
      {videoList.length === 0 ? (
        <VideoEmptyState />
      ) : (
        <section aria-label="Lista de videos indexados">
          {/* Asymmetric grid: first card is featured (wider), rest are standard */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videoList.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                variant={index === 0 ? 'featured' : 'default'}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function PlusIcon() {
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
