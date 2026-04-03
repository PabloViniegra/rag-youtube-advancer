'use client'

/**
 * /dashboard/videos/new
 *
 * Ingestion form — Client Component.
 * Calls the `ingestVideo` Server Action and shows phase progress while waiting.
 */

import { useEffect, useRef, useState } from 'react'
import { ingestVideo } from '@/lib/pipeline/ingest'
import type { IngestResult } from '@/lib/pipeline/types'
import { INGEST_ERROR } from '@/lib/pipeline/types'
import { cn } from '@/lib/utils'
import type { SuccessData } from './_components/success-card'
import { SuccessCard } from './_components/success-card'

// ── Loading messages ─────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  'Analizando el contenido del video…',
  'Esto puede tardar unos segundos…',
  'Procesando la transcripción…',
  'Optimizando fragmentos para búsqueda…',
  'Casi listo, generando embeddings…',
] as const satisfies readonly string[]

// ── Phase labels ──────────────────────────────────────────────────────────────

const PHASE_LABELS = [
  'Extrayendo transcripción...',
  'Dividiendo en fragmentos...',
  'Generando embeddings...',
  'Guardando en base de datos...',
  'Generando informe de inteligencia...',
] as const satisfies readonly string[]

// ── Error messages ────────────────────────────────────────────────────────────

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
  SUCCESS: 'success',
  ERROR: 'error',
} as const

type FormState = (typeof FORM_STATE)[keyof typeof FORM_STATE]

interface ErrorData {
  message: string
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function NuevoVideoPage() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [formState, setFormState] = useState<FormState>(FORM_STATE.IDLE)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [errorData, setErrorData] = useState<ErrorData | null>(null)

  // Keep a stable ref so the useEffect cleanup can always cancel it, even if
  // the component unmounts mid-ingestion.
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
    setSuccessData(null)
    setErrorData(null)

    phaseTimerRef.current = setInterval(() => {
      setPhaseIndex((prev) => Math.min(prev + 1, PHASE_LABELS.length - 1))
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
      setSuccessData({
        videoId: result.videoId,
        sectionCount: result.sectionCount,
        report: result.report,
      })
      setFormState(FORM_STATE.SUCCESS)
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

  const isSuccess = formState === FORM_STATE.SUCCESS && successData

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-8',
        isSuccess ? 'max-w-4xl' : 'max-w-xl',
      )}
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">
          Añadir video
        </h1>
        <p className="font-body text-sm text-on-surface-variant">
          Pega la URL de un video de YouTube para indexarlo en tu Segunda Mente.
        </p>
      </div>

      {isSuccess ? (
        <SuccessCard
          data={successData}
          onReset={() => {
            setUrl('')
            setTitle('')
            setFormState(FORM_STATE.IDLE)
          }}
        />
      ) : (
        <section
          aria-labelledby="form-heading"
          className="flex flex-col gap-6 rounded-2xl border border-outline-variant bg-background p-6 shadow-sm"
        >
          <h2 id="form-heading" className="sr-only">
            Formulario de ingesta
          </h2>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            noValidate
          >
            <UrlField
              value={url}
              onChange={setUrl}
              disabled={formState === FORM_STATE.LOADING}
            />
            <TitleField
              value={title}
              onChange={setTitle}
              disabled={formState === FORM_STATE.LOADING}
            />

            {formState === FORM_STATE.ERROR && errorData && (
              <ErrorBanner message={errorData.message} />
            )}

            {formState === FORM_STATE.LOADING ? (
              <PhaseProgress phaseIndex={phaseIndex} />
            ) : (
              <SubmitButton disabled={!url.trim()} />
            )}
          </form>
        </section>
      )}
    </div>
  )
}

// ── Field components ──────────────────────────────────────────────────────────

interface UrlFieldProps {
  value: string
  onChange: (v: string) => void
  disabled: boolean
}

function UrlField({ value, onChange, disabled }: UrlFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="youtube-url"
        className="font-body text-xs font-semibold text-on-surface-variant"
      >
        URL de YouTube{' '}
        <span aria-hidden="true" className="text-error">
          *
        </span>
      </label>
      <input
        id="youtube-url"
        type="url"
        required
        placeholder="https://www.youtube.com/watch?v=..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-describedby="youtube-url-hint"
        className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <p
        id="youtube-url-hint"
        className="font-body text-xs text-on-surface-variant"
      >
        Admite URLs estándar, cortas (youtu.be) y con timestamp.
      </p>
    </div>
  )
}

interface TitleFieldProps {
  value: string
  onChange: (v: string) => void
  disabled: boolean
}

function TitleField({ value, onChange, disabled }: TitleFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="video-title"
        className="font-body text-xs font-semibold text-on-surface-variant"
      >
        Título{' '}
        <span className="font-normal text-on-surface-variant/60">
          (opcional)
        </span>
      </label>
      <input
        id="video-title"
        type="text"
        placeholder="Mi video favorito"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  )
}

// ── Phase step state ──────────────────────────────────────────────────────────

const PHASE_STEP_STATE = {
  done: 'done',
  active: 'active',
  pending: 'pending',
} as const

type PhaseStepState = (typeof PHASE_STEP_STATE)[keyof typeof PHASE_STEP_STATE]

// ── Phase progress ────────────────────────────────────────────────────────────

interface PhaseProgressProps {
  phaseIndex: number
}

function PhaseProgress({ phaseIndex }: PhaseProgressProps) {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-2">
        {PHASE_LABELS.map((label, i) => (
          <PhaseStep
            key={label}
            label={label}
            state={
              i < phaseIndex
                ? PHASE_STEP_STATE.done
                : i === phaseIndex
                  ? PHASE_STEP_STATE.active
                  : PHASE_STEP_STATE.pending
            }
          />
        ))}
      </ol>
      <p
        aria-live="polite"
        aria-atomic="true"
        className="text-center font-body text-xs text-on-surface-variant transition-opacity duration-300"
      >
        {LOADING_MESSAGES[msgIndex]}
      </p>
    </div>
  )
}

interface PhaseStepProps {
  label: string
  state: PhaseStepState
}

function PhaseStep({ label, state }: PhaseStepProps) {
  return (
    <li className="flex items-center gap-3">
      <PhaseStepIcon state={state} />
      <span
        className={cn(
          'font-body text-sm',
          state === PHASE_STEP_STATE.active && 'font-semibold text-on-surface',
          state === PHASE_STEP_STATE.done &&
            'text-on-surface-variant line-through',
          state === PHASE_STEP_STATE.pending && 'text-on-surface-variant/40',
        )}
      >
        {label}
      </span>
    </li>
  )
}

function PhaseStepIcon({ state }: { state: PhaseStepState }) {
  if (state === PHASE_STEP_STATE.done) {
    return (
      <span
        aria-hidden="true"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 6l3 3 5-5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }
  if (state === PHASE_STEP_STATE.active) {
    return (
      <span
        aria-hidden="true"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary"
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-outline-variant"
    />
  )
}

// ── Submit button ─────────────────────────────────────────────────────────────

function SubmitButton({ disabled }: { disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-body text-sm font-semibold text-on-primary transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Analizar video
    </button>
  )
}

// ── Error banner ──────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-error/30 bg-error-container px-4 py-3"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-error"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 8v4M12 16h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <p className="font-body text-sm text-on-error-container">{message}</p>
    </div>
  )
}
