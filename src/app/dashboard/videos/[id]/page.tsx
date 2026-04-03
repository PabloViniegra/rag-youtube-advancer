import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ViewTransition } from 'react'
import type { IntelligenceReport } from '@/lib/intelligence/types'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { IntelligenceReportView } from '../_components/intelligence-report'
import { VideoDetailHeader } from './_components/video-detail-header'
import { VideoSectionsList } from './_components/video-sections-list'

type VideoRow = Database['public']['Tables']['videos']['Row']
type SectionRow = Database['public']['Tables']['video_sections']['Row']
type ReportRow = Database['public']['Tables']['intelligence_reports']['Row']

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

  // Fetch sections + intelligence report in parallel to avoid waterfall
  const [sectionsResult, reportResult] = await Promise.all([
    supabase
      .from('video_sections')
      .select('id, content')
      .eq('video_id', id)
      .order('id'),
    supabase
      .from('intelligence_reports')
      .select('report')
      .eq('video_id', id)
      .maybeSingle(),
  ])

  const typedSections = (sectionsResult.data ?? []) as Pick<
    SectionRow,
    'id' | 'content'
  >[]

  const reportData = reportResult.data
    ? ((reportResult.data as ReportRow).report as unknown as IntelligenceReport)
    : null

  return (
    <ViewTransition
      enter={{
        'nav-forward': 'slide-from-right',
        'nav-back': 'slide-from-left',
        default: 'slide-up',
      }}
      exit={{
        'nav-forward': 'slide-to-left',
        'nav-back': 'slide-to-right',
        default: 'none',
      }}
      default="none"
    >
      <div className="flex flex-col gap-10">
        {/* Header: thumbnail + meta + actions */}
        <div className="rounded-2xl border border-outline-variant bg-background p-6 shadow-sm">
          <VideoDetailHeader
            video={typedVideo}
            sectionCount={typedSections.length}
          />
        </div>

        {/* Informe de inteligencia — solo si está disponible */}
        {reportData ? <IntelligenceReportView report={reportData} /> : null}

        {/* Sections list */}
        <VideoSectionsList sections={typedSections} />
      </div>
    </ViewTransition>
  )
}
