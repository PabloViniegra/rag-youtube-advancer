import Image from 'next/image'
import Link from 'next/link'
import type { Database } from '@/lib/supabase/types'

type VideoRow = Database['public']['Tables']['videos']['Row']

interface VideoCardProps {
  video: VideoRow
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function VideoCard({ video }: VideoCardProps) {
  const thumbnailUrl = `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtube_id}`

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-background shadow-sm transition-all hover:shadow-md hover:border-outline focus-within:ring-2 focus-within:ring-primary/40">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-surface-container">
        <Image
          src={thumbnailUrl}
          alt={video.title ?? `Video ${video.youtube_id}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Title */}
        <h3 className="font-headline text-sm font-bold leading-snug text-on-surface line-clamp-2">
          {video.title ?? 'Sin título'}
        </h3>

        {/* YouTube ID chip + date */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-2.5 py-0.5 font-body text-xs font-medium text-on-primary-container hover:bg-primary hover:text-on-primary transition-colors"
            aria-label={`Abrir video ${video.youtube_id} en YouTube`}
          >
            <YoutubeChipIcon />
            {video.youtube_id}
          </a>

          <time
            dateTime={video.created_at}
            className="font-body text-xs text-on-surface-variant"
          >
            {formatDate(video.created_at)}
          </time>
        </div>

        {/* Detail link */}
        <Link
          href={`/dashboard/videos/${video.id}`}
          className="mt-1 inline-flex h-8 items-center justify-center rounded-xl border border-outline-variant font-body text-xs font-semibold text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Ver detalles
        </Link>
      </div>
    </article>
  )
}

function YoutubeChipIcon() {
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
