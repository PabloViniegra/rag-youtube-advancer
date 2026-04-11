import Image from 'next/image'
import Link from 'next/link'
import { ViewTransition } from 'react'

export interface VideoItem {
  id: string
  youtube_id: string
  title: string | null
  created_at: string
  sectionCount: number
}

interface RecentVideosProps {
  videos: VideoItem[]
}

function getRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'hoy'
  if (diffDays === 1) return 'ayer'
  if (diffDays < 7) return `hace ${diffDays} días`
  if (diffDays < 14) return 'hace 1 semana'
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `hace ${weeks} semana${weeks === 1 ? '' : 's'}`
  }
  const months = Math.floor(diffDays / 30)
  return `hace ${months} mes${months === 1 ? '' : 'es'}`
}

export function RecentVideos({ videos }: RecentVideosProps) {
  if (videos.length === 0) return null

  return (
    <section aria-label="Videos indexados recientemente">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Indexados recientemente
        </h2>
        <Link
          href="/dashboard/videos"
          transitionTypes={['nav-forward']}
          className="font-body text-xs font-semibold text-primary transition-colors hover:text-primary-dim"
        >
          Ver todos →
        </Link>
      </div>

      {/*
       * ViewTransition per item — "List identity" pattern.
       * Each video card gets its own VT keyed by id, so React can track
       * individual items across renders and animate reorder/enter/exit
       * when the list changes (e.g. video deleted, new video indexed).
       */}
      <ul className="flex flex-col gap-2">
        {videos.map((video) => (
          <ViewTransition key={video.id}>
            <li>
              <Link
                href={`/dashboard/videos/${video.id}`}
                transitionTypes={['nav-forward']}
                className="group flex items-center gap-3 rounded-lg border border-outline-variant bg-background px-3 py-3 transition-colors hover:border-outline hover:bg-surface-container"
              >
                {/* YouTube thumbnail */}
                <div className="relative h-8 w-14 flex-shrink-0 overflow-hidden rounded bg-surface-container-high">
                  <Image
                    src={`https://i.ytimg.com/vi/${video.youtube_id}/default.jpg`}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-sm font-semibold text-on-surface transition-colors group-hover:text-primary">
                    {video.title ?? video.youtube_id}
                  </p>
                  <p className="font-body text-[11px] text-on-surface-variant">
                    {getRelativeTime(video.created_at)} ·{' '}
                    {video.sectionCount.toLocaleString('es-ES')} fragmentos
                  </p>
                </div>
              </Link>
            </li>
          </ViewTransition>
        ))}
      </ul>
    </section>
  )
}
