// Pipeline orchestrator — types
// const-first pattern, flat interfaces, no `any`

import type { IntelligenceReport } from '@/lib/intelligence/types'
import type { SeoReport } from '@/lib/seo/types'

export const INGEST_ERROR = {
  INVALID_URL: 'invalid_url',
  TRANSCRIPT_FAILED: 'transcript_failed',
  CHUNK_FAILED: 'chunk_failed',
  EMBED_FAILED: 'embed_failed',
  STORE_FAILED: 'store_failed',
  REPORT_FAILED: 'report_failed',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  VIDEO_LIMIT_REACHED: 'video_limit_reached',
} as const

export type IngestErrorCode = (typeof INGEST_ERROR)[keyof typeof INGEST_ERROR]

export interface IngestInput {
  youtubeUrl: string
  title: string
}

export interface IngestProgress {
  phase: 1 | 2 | 3 | 4 | 5 | 6
  label: string
}

export interface IngestSuccess {
  ok: true
  videoId: string
  sectionCount: number
  /** Intelligence Report generated after indexing (null if generation failed). */
  report: IntelligenceReport | null
  /** SEO Pack generated after Intelligence Report (null if generation failed). */
  seoReport: SeoReport | null
}

export interface IngestError {
  ok: false
  code: IngestErrorCode
  message: string
}

export type IngestResult = IngestSuccess | IngestError
