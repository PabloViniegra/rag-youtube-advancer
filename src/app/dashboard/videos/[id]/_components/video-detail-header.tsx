import Image from 'next/image'
import Link from 'next/link'
import type { Database } from '@/lib/supabase/types'

type VideoRow = Database['public']['Tables']['videos']['Row']

interface VideoDetailHeaderProps {
  video: VideoRow
  sectionCount: number
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

export function VideoDetailHeader({
  video,
  sectionCount,
}: VideoDetailHeaderProps) {
  const thumbnailUrl = `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtube_id}`

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-surface-container sm:w-64">
        <Image
          src={thumbnailUrl}
          alt={video.title ?? `Video ${video.youtube_id}`}
          fill
          sizes="(max-width: 640px) 100vw, 256px"
          className="object-cover"
          priority
        />
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col gap-4">
        <h1 className="font-headline text-2xl font-extrabold leading-tight text-on-surface">
          {video.title ?? 'Sin título'}
        </h1>

        {/* Stats row */}
        <dl className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-0.5">
            <dt className="font-body text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Fragmentos indexados
            </dt>
            <dd className="font-headline text-2xl font-bold text-primary">
              {sectionCount}
            </dd>
          </div>

          <div className="flex flex-col gap-0.5">
            <dt className="font-body text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Indexado el
            </dt>
            <dd className="font-body text-sm text-on-surface">
              <time dateTime={video.created_at}>
                {formatDate(video.created_at)}
              </time>
            </dd>
          </div>

          <div className="flex flex-col gap-0.5">
            <dt className="font-body text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              YouTube ID
            </dt>
            <dd>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir video ${video.youtube_id} en YouTube`}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-2.5 py-0.5 font-body text-xs font-medium text-on-primary-container transition-colors hover:bg-primary hover:text-on-primary"
              >
                <YoutubeIcon />
                {video.youtube_id}
              </a>
            </dd>
          </div>
        </dl>

        {/* Actions */}
        <div className="mt-auto flex flex-wrap gap-3 pt-2">
          <Link
            href={`/dashboard/search?video=${video.youtube_id}`}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 font-body text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <SearchIcon />
            Hacer una pregunta
          </Link>

          <Link
            href="/dashboard/videos"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-outline-variant px-5 font-body text-sm font-semibold text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Volver a mis videos
          </Link>
        </div>
      </div>
    </div>
  )
}

function YoutubeIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42C1 8.14 1 11.72 1 11.72s0 3.58.46 5.3a2.78 2.78 0 0 0 1.95 1.95C5.12 19.44 12 19.44 12 19.44s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95C23 15.3 23 11.72 23 11.72s0-3.58-.46-5.3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m9.75 15.02 5.75-3.3-5.75-3.3v6.6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path
        d="m21 21-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
