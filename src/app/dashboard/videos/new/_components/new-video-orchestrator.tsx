'use client'

/**
 * NewVideoOrchestrator
 *
 * Client component that owns the ingestion state machine:
 *   idle → loading → error | success
 *
 * On success: shows SuccessCard instead of immediately redirecting.
 * "Ver video" inside SuccessCard handles the final navigation.
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
import { resolveIngestErrorMessage } from './ingest-error-messages'
import { IngestForm } from './ingest-form'
import { PHASE_COUNT } from './phase-progress'
import type { SuccessData } from './success-card'
import { SuccessCard } from './success-card'

// ── Types ─────────────────────────────────────────────────────────────────────

const FORM_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
} as const

type FormState = (typeof FORM_STATE)[keyof typeof FORM_STATE]

interface ErrorData {
  message: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PHASE_TICK_MS = 2500
const PHASE_COMPLETE_STEP_MS = 220

// ── Component ─────────────────────────────────────────────────────────────────

export function NewVideoOrchestrator() {
  const router = useRouter()

  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [formState, setFormState] = useState<FormState>(FORM_STATE.IDLE)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [errorData, setErrorData] = useState<ErrorData | null>(null)
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [videoCount, setVideoCount] = useState(0)

  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseIndexRef = useRef(0)

  // Fetch current video count on mount for capacity meter / first-video detection
  useEffect(() => {
    fetch('/api/library-stats')
      .then((res) => res.json() as Promise<{ videoCount: number }>)
      .then((data) => setVideoCount(data.videoCount))
      .catch(() => {
        // Non-critical — defaults to 0 (triggers first-video confetti if real count > 0)
      })
  }, [])

  useEffect(() => {
    phaseIndexRef.current = phaseIndex
  }, [phaseIndex])

  useEffect(() => {
    return () => {
      if (phaseTimerRef.current !== null) {
        clearInterval(phaseTimerRef.current)
      }
    }
  }, [])

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setFormState(FORM_STATE.LOADING)
    setPhaseIndex(0)
    setErrorData(null)
    setSuccessData(null)
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

      setSuccessData({
        videoId: result.videoId,
        sectionCount: result.sectionCount,
        report: result.report,
      })
      setFormState(FORM_STATE.SUCCESS)
    } else {
      const message = resolveIngestErrorMessage(result.code, result.message)
      setErrorData({ message })
      setFormState(FORM_STATE.ERROR)
    }
  }

  function handleReset() {
    setFormState(FORM_STATE.IDLE)
    setSuccessData(null)
    setUrl('')
    setTitle('')
  }

  // ── Success state ──────────────────────────────────────────────────────────

  if (formState === FORM_STATE.SUCCESS && successData !== null) {
    return (
      <SuccessCard
        data={successData}
        onReset={handleReset}
        totalVideoCount={videoCount}
        isFirstVideo={videoCount === 0}
      />
    )
  }

  // ── Form states (idle / loading / error) ───────────────────────────────────

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
