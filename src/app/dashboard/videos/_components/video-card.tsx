import Image from 'next/image'
import Link from 'next/link'
import type { Database } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

type VideoRow = Database['public']['Tables']['videos']['Row']

interface VideoCardProps {
  video: VideoRow
  /** Visual emphasis variant — alternates to break identical-grid monotony */
  variant?: 'default' | 'featured'
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function VideoCard({ video, variant = 'default' }: VideoCardProps) {
  const thumbnailUrl = `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtube_id}`
  const isFeatured = variant === 'featured'

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-background transition-all duration-200',
        'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/8 focus-within:ring-2 focus-within:ring-primary/40',
        isFeatured && 'md:col-span-2 border-primary/30',
      )}
    >
      {/* ── Thumbnail — full-bleed hero with hover overlay ── */}
      <div
        className={cn(
          'relative w-full overflow-hidden bg-surface-container',
          isFeatured ? 'aspect-[21/9]' : 'aspect-video',
        )}
      >
        <Image
          src={thumbnailUrl}
          alt={video.title ?? `Video ${video.youtube_id}`}
          fill
          sizes={
            isFeatured
              ? '(max-width: 640px) 100vw, 66vw'
              : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
          }
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* Crimson overlay on hover — editorial "Ver detalles" CTA (pointer devices) */}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/90 via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Link
            href={`/dashboard/videos/${video.id}`}
            className="w-full px-4 pb-4 font-headline text-sm font-bold text-on-primary focus-visible:outline-none"
            aria-label={`Ver detalles de ${video.title ?? video.youtube_id}`}
            tabIndex={-1}
          >
            Ver detalles →
          </Link>
        </div>

        {/* External YouTube link — always visible on touch, hover-reveal on pointer */}
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir en YouTube"
          className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-opacity duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 hover:bg-black/80 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <YoutubeIcon />
        </a>
      </div>

      {/* ── Card body — strong typographic hierarchy ── */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Title — headline scale, clamps to 2 lines */}
        <h3
          className={cn(
            'font-headline font-extrabold leading-snug text-on-surface line-clamp-2',
            isFeatured ? 'text-lg' : 'text-sm',
          )}
        >
          {video.title ?? (
            <span className="text-on-surface-variant italic">Sin título</span>
          )}
        </h3>

        {/* Footer — date + detail link */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-outline-variant/50">
          <time
            dateTime={video.created_at}
            className="font-body text-xs text-on-surface-variant tabular-nums"
          >
            {formatDate(video.created_at)}
          </time>

          {/* Visible "Ver detalles" link — primary tap target on mobile */}
          <Link
            href={`/dashboard/videos/${video.id}`}
            className="inline-flex min-h-[44px] min-w-[44px] items-center rounded px-1 font-body text-xs font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </article>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function YoutubeIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42C1 8.14 1 11.72 1 11.72s0 3.58.46 5.3a2.78 2.78 0 0 0 1.95 1.95C5.12 19.44 12 19.44 12 19.44s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95C23 15.3 23 11.72 23 11.72s0-3.58-.46-5.3Z"
        fill="currentColor"
      />
      <path d="m9.75 15.02 5.75-3.3-5.75-3.3v6.6Z" fill="white" />
    </svg>
  )
}
