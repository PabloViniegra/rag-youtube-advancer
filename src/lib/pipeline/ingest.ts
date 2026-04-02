'use server'

/**
 * Pipeline orchestrator — Server Action
 *
 * Chains all 4 RAG ingestion phases by calling the internal Next.js API routes:
 *   1. POST /api/transcript  — extract full transcript from a YouTube URL
 *   2. POST /api/chunk       — split transcript text into overlapping segments
 *   3. POST /api/embed       — convert segments into 1536-dim vectors
 *   4. POST /api/store       — persist video + embedded sections to Supabase
 *
 * Auth cookies are forwarded to every downstream fetch so Supabase middleware
 * can authenticate each sub-request.
 */

import { headers } from 'next/headers'

import type {
  IngestError,
  IngestErrorCode,
  IngestInput,
  IngestResult,
  IngestSuccess,
} from './types'
import { INGEST_ERROR } from './types'

// ─── internal response shapes ─────────────────────────────────────────────────

interface TranscriptOk {
  videoId: string
  fullText: string
}
interface ChunkOk {
  chunks: string[]
}
interface EmbedItem {
  content: string
  index: number
  embedding: number[]
}
interface EmbedOk {
  data: EmbedItem[]
}
interface StoreOk {
  videoId: string
  count: number
}

interface ApiErrorPayload {
  error?: string
  message?: string
}

// ─── type guards ──────────────────────────────────────────────────────────────

function isTranscriptOk(v: unknown): v is TranscriptOk {
  if (typeof v !== 'object' || v === null) return false
  const r = v as Record<string, unknown>
  return typeof r.videoId === 'string' && typeof r.fullText === 'string'
}

function isChunkOk(v: unknown): v is ChunkOk {
  if (typeof v !== 'object' || v === null) return false
  const r = v as Record<string, unknown>
  return (
    Array.isArray(r.chunks) &&
    (r.chunks as unknown[]).every((c) => typeof c === 'string')
  )
}

function isEmbedItem(v: unknown): v is EmbedItem {
  if (typeof v !== 'object' || v === null) return false
  const r = v as Record<string, unknown>
  return (
    typeof r.content === 'string' &&
    typeof r.index === 'number' &&
    Array.isArray(r.embedding) &&
    (r.embedding as unknown[]).every((n) => typeof n === 'number')
  )
}

function isEmbedOk(v: unknown): v is EmbedOk {
  if (typeof v !== 'object' || v === null) return false
  const r = v as Record<string, unknown>
  return Array.isArray(r.data) && (r.data as unknown[]).every(isEmbedItem)
}

function isStoreOk(v: unknown): v is StoreOk {
  if (typeof v !== 'object' || v === null) return false
  const r = v as Record<string, unknown>
  return typeof r.videoId === 'string' && typeof r.count === 'number'
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function ingestError(code: IngestErrorCode, message: string): IngestError {
  return { ok: false, code, message }
}

function ingestSuccess(videoId: string, sectionCount: number): IngestSuccess {
  return { ok: true, videoId, sectionCount }
}

/**
 * Maps an HTTP status to an auth error code, or returns `fallback` for
 * any other non-200 status.
 */
function resolveErrorCode(
  status: number,
  fallback: IngestErrorCode,
): IngestErrorCode {
  if (status === 401) return INGEST_ERROR.UNAUTHORIZED
  if (status === 403) return INGEST_ERROR.FORBIDDEN
  return fallback
}

function resolveApiErrorMessage(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null
  const payload = data as ApiErrorPayload

  if (typeof payload.error === 'string' && payload.error.trim() !== '') {
    return payload.error
  }

  if (typeof payload.message === 'string' && payload.message.trim() !== '') {
    return payload.message
  }

  return null
}

// ─── Server Action ────────────────────────────────────────────────────────────

export async function ingestVideo(input: IngestInput): Promise<IngestResult> {
  const { youtubeUrl, title } = input

  const h = await headers()
  const host = h.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${protocol}://${host}`
  const cookieHeader = h.get('cookie') ?? ''

  const fetchJson = async (
    path: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number; data: unknown }> => {
    const res = await fetch(`${origin}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      body: JSON.stringify(payload),
    })
    let data: unknown = null
    try {
      data = await res.json()
    } catch {
      /* leave null */
    }
    return { status: res.status, data }
  }

  // ── Phase 1 — Transcript ──────────────────────────────────────────────────
  const t = await fetchJson('/api/transcript', { url: youtubeUrl })
  if (t.status !== 200) {
    const apiMessage = resolveApiErrorMessage(t.data)
    return ingestError(
      resolveErrorCode(t.status, INGEST_ERROR.TRANSCRIPT_FAILED),
      apiMessage ?? 'Transcript extraction failed.',
    )
  }
  if (!isTranscriptOk(t.data)) {
    return ingestError(
      INGEST_ERROR.TRANSCRIPT_FAILED,
      'Invalid transcript response.',
    )
  }
  const { videoId: youtubeId, fullText } = t.data

  // ── Phase 2 — Chunk ───────────────────────────────────────────────────────
  const c = await fetchJson('/api/chunk', { text: fullText })
  if (c.status !== 200) {
    const apiMessage = resolveApiErrorMessage(c.data)
    return ingestError(
      resolveErrorCode(c.status, INGEST_ERROR.CHUNK_FAILED),
      apiMessage ?? 'Text chunking failed.',
    )
  }
  if (!isChunkOk(c.data)) {
    return ingestError(INGEST_ERROR.CHUNK_FAILED, 'Invalid chunk response.')
  }
  const { chunks } = c.data

  // ── Phase 3 — Embed ───────────────────────────────────────────────────────
  const e = await fetchJson('/api/embed', { chunks })
  if (e.status !== 200) {
    const apiMessage = resolveApiErrorMessage(e.data)
    return ingestError(
      resolveErrorCode(e.status, INGEST_ERROR.EMBED_FAILED),
      apiMessage ?? 'Embedding generation failed.',
    )
  }
  if (!isEmbedOk(e.data)) {
    return ingestError(INGEST_ERROR.EMBED_FAILED, 'Invalid embed response.')
  }
  const sections = e.data.data

  // ── Phase 4 — Store ───────────────────────────────────────────────────────
  const s = await fetchJson('/api/store', { youtubeId, title, sections })
  if (s.status !== 200) {
    const apiMessage = resolveApiErrorMessage(s.data)
    return ingestError(
      resolveErrorCode(s.status, INGEST_ERROR.STORE_FAILED),
      apiMessage ?? 'Storing video sections failed.',
    )
  }
  if (!isStoreOk(s.data)) {
    return ingestError(INGEST_ERROR.STORE_FAILED, 'Invalid store response.')
  }

  return ingestSuccess(s.data.videoId, s.data.count)
}
