import Image from 'next/image'
import Link from 'next/link'
import { ViewTransition } from 'react'
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
    <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-surface-container sm:w-64">
        <ViewTransition
          name={`video-thumb-${video.id}`}
          share="morph"
          default="none"
        >
          <Image
            src={thumbnailUrl}
            alt={video.title ?? `Video ${video.youtube_id}`}
            fill
            sizes="(max-width: 640px) 100vw, 256px"
            className="object-cover"
            priority
          />
        </ViewTransition>
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col gap-6">
        <h1 className="font-headline text-3xl font-extrabold leading-[1.1] tracking-tight text-on-surface">
          {video.title ?? 'Sin título'}
        </h1>

        {/* Stats row - reorganizado: fecha como anchor, fragments como secondary */}
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <div className="flex flex-col gap-1">
            <span className="font-body text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              Indexado el
            </span>
            <time
              dateTime={video.created_at}
              className="font-body text-sm text-on-surface"
            >
              {formatDate(video.created_at)}
            </time>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-body text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              Fragmentos
            </span>
            <span className="font-headline text-lg font-bold text-primary">
              {sectionCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver en YouTube`}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-body text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container-hover hover:text-on-surface"
            >
              <YoutubeIcon />
              <span>{video.youtube_id}</span>
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href={`/dashboard/search?video=${video.youtube_id}`}
            transitionTypes={['nav-forward']}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 font-body text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <SearchIcon />
            Hacer una pregunta
          </Link>

          <Link
            href="/dashboard/videos"
            transitionTypes={['nav-back']}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-outline-variant px-5 font-body text-sm font-medium text-on-surface-variant transition-all hover:bg-surface-container-hover hover:text-on-surface"
          >
            Volver
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
