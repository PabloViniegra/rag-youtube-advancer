'use client'

/**
 * NewVideoOrchestrator
 *
 * Client component that owns the ingestion state machine:
 *   idle → loading → error (success redirects immediately)
 *
 * Extracted from new/page.tsx so the static hero section is SSR'd.
 */

import { useRouter } from 'next/navigation'
import {
  addTransitionType,
  startTransition,
  useEffect,
  useRef,
  useState,
} from 'react'
import { ingestVideo } from '@/lib/pipeline/ingest'
import type { IngestResult } from '@/lib/pipeline/types'
import { INGEST_ERROR } from '@/lib/pipeline/types'
import { IngestForm } from './ingest-form'
import { PHASE_COUNT } from './phase-progress'

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

const PHASE_TICK_MS = 2500
const PHASE_COMPLETE_STEP_MS = 220

type FormState = (typeof FORM_STATE)[keyof typeof FORM_STATE]

interface ErrorData {
  message: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function NewVideoOrchestrator() {
  const router = useRouter()

  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [formState, setFormState] = useState<FormState>(FORM_STATE.IDLE)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [errorData, setErrorData] = useState<ErrorData | null>(null)

  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseIndexRef = useRef(0)

  useEffect(() => {
    phaseIndexRef.current = phaseIndex
  }, [phaseIndex])

  function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  async function animateToFinalPhase(): Promise<void> {
    const target = PHASE_COUNT - 1
    let current = phaseIndexRef.current

    while (current < target) {
      current += 1
      startTransition(() => {
        setPhaseIndex(current)
      })
      phaseIndexRef.current = current
      await wait(PHASE_COMPLETE_STEP_MS)
    }
  }

  useEffect(() => {
    return () => {
      if (phaseTimerRef.current !== null) {
        clearInterval(phaseTimerRef.current)
      }
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Loading feedback must appear immediately, not as a low-priority transition.
    setFormState(FORM_STATE.LOADING)
    setPhaseIndex(0)
    setErrorData(null)
    phaseIndexRef.current = 0

    phaseTimerRef.current = setInterval(() => {
      setPhaseIndex((prev) => {
        const next = Math.min(prev + 1, PHASE_COUNT - 1)
        phaseIndexRef.current = next
        return next
      })
    }, PHASE_TICK_MS)

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
      await animateToFinalPhase()

      // addTransitionType marks the navigation direction for page-level VTs
      startTransition(() => {
        addTransitionType('nav-forward')
        router.push(`/dashboard/videos/${result.videoId}`)
      })
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
  )
}
