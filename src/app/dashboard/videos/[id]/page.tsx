import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ViewTransition } from 'react'
import type {
  IntelligenceReport,
  IntelligenceTimestamp,
} from '@/lib/intelligence/types'
import type { SeoReport } from '@/lib/seo/types'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { VideoDetailHeader } from './_components/video-detail-header'
import { VideoReportTabs } from './_components/video-report-tabs'
import { VideoSectionsList } from './_components/video-sections-list'

type VideoRow = Database['public']['Tables']['videos']['Row']
type SectionRow = Database['public']['Tables']['video_sections']['Row']
type ReportRow = Database['public']['Tables']['intelligence_reports']['Row']
type SeoReportRow = Database['public']['Tables']['seo_reports']['Row']

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

  // Fetch sections + intelligence report + SEO report in parallel — no waterfall
  const [sectionsResult, reportResult, seoReportResult] = await Promise.all([
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
    supabase
      .from('seo_reports')
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

  const seoReportData = seoReportResult.data
    ? ((seoReportResult.data as SeoReportRow).report as unknown as SeoReport)
    : null

  // Chapter markers need the timestamps from the Intelligence Report
  const irTimestamps: IntelligenceTimestamp[] =
    reportData?.summary?.timestamps ?? []

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

        {/* Intelligence + SEO reports — tab UI when both present, plain when only one */}
        <VideoReportTabs
          reportData={reportData}
          seoReportData={seoReportData}
          irTimestamps={irTimestamps}
        />

        {/* Sections list */}
        <VideoSectionsList sections={typedSections} />
      </div>
    </ViewTransition>
  )
}
