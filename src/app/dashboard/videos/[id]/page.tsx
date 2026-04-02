import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { VideoDetailHeader } from './_components/video-detail-header'
import { VideoSectionsList } from './_components/video-sections-list'

type VideoRow = Database['public']['Tables']['videos']['Row']
type SectionRow = Database['public']['Tables']['video_sections']['Row']

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: video } = await supabase
    .from('videos')
    .select('title')
    .eq('id', id)
    .maybeSingle()

  const title = (video as Pick<VideoRow, 'title'> | null)?.title ?? 'Video'

  return {
    title: `${title} — Dashboard`,
  }
}

export default async function VideoDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirectTo=/dashboard/videos/${id}`)
  }

  // Fetch video — RLS ensures only own videos are visible
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (videoError || !video) {
    notFound()
  }

  const typedVideo = video as VideoRow

  // Fetch sections for this video
  const { data: sections } = await supabase
    .from('video_sections')
    .select('id, content')
    .eq('video_id', id)
    .order('id')

  const typedSections = (sections ?? []) as Pick<SectionRow, 'id' | 'content'>[]

  return (
    <div className="flex flex-col gap-10">
      {/* Header: thumbnail + meta + actions */}
      <div className="rounded-2xl border border-outline-variant bg-background p-6 shadow-sm">
        <VideoDetailHeader
          video={typedVideo}
          sectionCount={typedSections.length}
        />
      </div>

      {/* Sections list */}
      <VideoSectionsList sections={typedSections} />
    </div>
  )
}
