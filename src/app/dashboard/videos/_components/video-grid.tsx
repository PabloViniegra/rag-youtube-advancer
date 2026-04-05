'use client'

import { startTransition, useOptimistic, ViewTransition } from 'react'
import type { Database } from '@/lib/supabase/types'
import { VideoCard } from './video-card'
import { VideoCardActions } from './video-card-actions'
import { VideoEmptyState } from './video-empty-state'

type VideoRow = Database['public']['Tables']['videos']['Row']

interface VideoGridProps {
  initialVideos: VideoRow[]
}

export function VideoGrid({ initialVideos }: VideoGridProps) {
  const [videos, removeVideo] = useOptimistic(
    initialVideos,
    (current: VideoRow[], removedId: string) =>
      current.filter((v) => v.id !== removedId),
  )

  function handleDeleteOptimistic(videoId: string) {
    startTransition(() => {
      removeVideo(videoId)
    })
  }

  if (videos.length === 0) return <VideoEmptyState />

  return (
    <section aria-label="Lista de videos indexados">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video, index) => (
          <ViewTransition key={video.id} default="none">
            <div className="relative">
              <VideoCard
                video={video}
                variant={index === 0 ? 'featured' : 'default'}
              />
              <div className="absolute right-2.5 top-2.5 z-10">
                <VideoCardActions
                  videoId={video.id}
                  videoTitle={video.title}
                  onDeleteOptimistic={() => handleDeleteOptimistic(video.id)}
                />
              </div>
            </div>
          </ViewTransition>
        ))}
      </div>
    </section>
  )
}
