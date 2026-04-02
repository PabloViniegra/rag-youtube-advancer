// Pipeline orchestrator — types
// const-first pattern, flat interfaces, no `any`

export const INGEST_ERROR = {
  INVALID_URL: 'invalid_url',
  TRANSCRIPT_FAILED: 'transcript_failed',
  CHUNK_FAILED: 'chunk_failed',
  EMBED_FAILED: 'embed_failed',
  STORE_FAILED: 'store_failed',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
} as const

export type IngestErrorCode = (typeof INGEST_ERROR)[keyof typeof INGEST_ERROR]

export interface IngestInput {
  youtubeUrl: string
  title: string
}

export interface IngestProgress {
  phase: 1 | 2 | 3 | 4
  label: string
}

export interface IngestSuccess {
  ok: true
  videoId: string
  sectionCount: number
}

export interface IngestError {
  ok: false
  code: IngestErrorCode
  message: string
}

export type IngestResult = IngestSuccess | IngestError
