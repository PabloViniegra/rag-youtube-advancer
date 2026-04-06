'use client'

/**
 * /dashboard/videos/new
 *
 * Ingestion page — Client Component.
 * Calls the `ingestVideo` Server Action, shows phase progress while waiting,
 * then redirects directly to the new video's detail page on success.
 *
 * Layout:
 *   1. Hero section — overline + H1 + subtitle + PipelineHint
 *   2. Form card (IngestForm) — URL field, title field, submit / loading / error
 */

import { useEffect, useRef, useState, ViewTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ingestVideo } from '@/lib/pipeline/ingest'
import type { IngestResult } from '@/lib/pipeline/types'
import { INGEST_ERROR } from '@/lib/pipeline/types'
import { IngestForm } from './_components/ingest-form'
import { PHASE_COUNT } from './_components/phase-progress'
import { PipelineHint } from './_components/pipeline-hint'

// ── Constants ─────────────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<string, string> = {
  [INGEST_ERROR.INVALID_URL]: 'La URL de YouTube no es válida.',
  [INGEST_ERROR.TRANSCRIPT_FAILED]:
    'No se pudo extraer la transcripción del video.',
  [INGEST_ERROR.CHUNK_FAILED]: 'Error al procesar el texto del video.',
  [INGEST_ERROR.EMBED_FAILED]: 'Error al generar los embeddings.',
  [INGEST_ERROR.STORE_FAILED]: 'Error al guardar el video en la base de datos.',
  [INGEST_ERROR.REPORT_FAILED]: 'Error al generar el informe de inteligencia.',
  [INGEST_ERROR.UNAUTHORIZED]: 'Debes iniciar sesión para añadir videos.',
  [INGEST_ERROR.FORBIDDEN]:
    'Necesitas una suscripción activa para añadir videos.',
  [INGEST_ERROR.VIDEO_LIMIT_REACHED]:
    'Has alcanzado el limite de tu plan gratuito (1 video). Actualiza a Pro para seguir indexando.',
}

const GENERIC_INGEST_MESSAGES = [
  'Transcript extraction failed.',
  'Text chunking failed.',
  'Embedding generation failed.',
  'Storing video sections failed.',
  'Invalid transcript response.',
  'Invalid chunk response.',
  'Invalid embed response.',
  'Invalid store response.',
] as const satisfies readonly string[]

const FORM_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
} as const

type FormState = (typeof FORM_STATE)[keyof typeof FORM_STATE]

interface ErrorData {
  message: string
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function NuevoVideoPage() {
  const router = useRouter()

  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [formState, setFormState] = useState<FormState>(FORM_STATE.IDLE)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [errorData, setErrorData] = useState<ErrorData | null>(null)

  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (phaseTimerRef.current !== null) {
        clearInterval(phaseTimerRef.current)
      }
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState(FORM_STATE.LOADING)
    setPhaseIndex(0)
    setErrorData(null)

    phaseTimerRef.current = setInterval(() => {
      setPhaseIndex((prev) => Math.min(prev + 1, PHASE_COUNT - 1))
    }, 2500)

    let result: IngestResult
    try {
      result = await ingestVideo({
        youtubeUrl: url,
        title: title.trim() || url,
      })
    } catch {
      result = {
        ok: false,
        code: INGEST_ERROR.TRANSCRIPT_FAILED,
        message: 'Error inesperado. Inténtalo de nuevo.',
      }
    } finally {
      if (phaseTimerRef.current !== null) {
        clearInterval(phaseTimerRef.current)
        phaseTimerRef.current = null
      }
    }

    if (result.ok) {
      router.push(`/dashboard/videos/${result.videoId}`)
    } else {
      const normalizedMessage = result.message.trim()
      const isGenericMessage = GENERIC_INGEST_MESSAGES.some(
        (message) => message === normalizedMessage,
      )

      const message =
        normalizedMessage === ''
          ? (ERROR_MESSAGES[result.code] ??
            'Error inesperado. Inténtalo de nuevo.')
          : isGenericMessage
            ? (ERROR_MESSAGES[result.code] ?? normalizedMessage)
            : normalizedMessage

      setErrorData({ message })
      setFormState(FORM_STATE.ERROR)
    }
  }

  return (
    <ViewTransition
      enter={{
        'nav-forward': 'slide-from-right',
        'nav-back': 'slide-from-left',
        default: 'none',
      }}
      exit={{
        'nav-forward': 'slide-to-left',
        'nav-back': 'slide-to-right',
        default: 'none',
      }}
      default="none"
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <header className="flex flex-col gap-4 animate-fade-up">
          <p className="font-headline text-xs font-bold uppercase tracking-widest text-primary">
            Segunda Mente
          </p>
          <h1 className="font-headline text-3xl font-extrabold leading-tight text-on-surface">
            Añadir video
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            Pega la URL de un video de YouTube para indexarlo. Lo analizamos en
            cinco pasos automáticos:
          </p>
          <PipelineHint />
        </header>

        {/* ── Form ───────────────────────────────────────────────────────── */}
        <IngestForm
          url={url}
          title={title}
          isLoading={formState === FORM_STATE.LOADING}
          isError={formState === FORM_STATE.ERROR}
          errorMessage={errorData?.message ?? null}
          phaseIndex={phaseIndex}
          onUrlChange={setUrl}
          onTitleChange={setTitle}
          onSubmit={handleSubmit}
        />
      </div>
    </ViewTransition>
  )
}
