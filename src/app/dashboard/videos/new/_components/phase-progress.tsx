'use client'

/**
 * PhaseProgress
 *
 * Redesigned loading state: horizontal progress bar with 6 circular step
 * indicators and a rotating message below. Replaces the old vertical list.
 *
 * Props:
 *  - phaseIndex: 0-based current phase (driven by parent's interval)
 */

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

const PHASE_STEP_STATE = {
  done: 'done',
  active: 'active',
  pending: 'pending',
} as const

type PhaseStepState = (typeof PHASE_STEP_STATE)[keyof typeof PHASE_STEP_STATE]

// ── Constants ─────────────────────────────────────────────────────────────────

const PHASE_LABELS = [
  'Transcripción',
  'Fragmentos',
  'Embeddings',
  'Base de datos',
  'Informe IA',
  'SEO Pack',
] as const satisfies readonly string[]

/** Full-text labels used as screen-reader text and for test queries. */
const PHASE_LABELS_FULL = [
  'Extrayendo transcripción...',
  'Dividiendo en fragmentos...',
  'Generando embeddings...',
  'Guardando en base de datos...',
  'Generando informe de inteligencia...',
  'Generando SEO Pack...',
] as const satisfies readonly string[]

const LOADING_MESSAGES = [
  'Analizando el contenido del video…',
  'Esto puede tardar unos segundos…',
  'Procesando la transcripción…',
  'Optimizando fragmentos para búsqueda…',
  'Casi listo, generando embeddings…',
] as const satisfies readonly string[]

export const PHASE_COUNT = PHASE_LABELS.length

// ── Sub-components ────────────────────────────────────────────────────────────

interface StepDotProps {
  label: string
  fullLabel: string
  state: PhaseStepState
  index: number
}

function StepDot({ label, fullLabel, state, index }: StepDotProps) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-1.5">
      {/* Accessible full label — visible to screen readers and test queries */}
      <span className="sr-only">{fullLabel}</span>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500',
          state === PHASE_STEP_STATE.done &&
            'border-primary bg-primary text-on-primary',
          state === PHASE_STEP_STATE.active &&
            'border-primary bg-background text-primary shadow-[0_0_0_4px_color-mix(in_oklch,var(--color-primary)_15%,transparent)]',
          state === PHASE_STEP_STATE.pending &&
            'border-outline-variant bg-surface-container-low text-on-surface-variant/40',
        )}
        aria-hidden="true"
      >
        {state === PHASE_STEP_STATE.done ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              strokeDasharray="1"
              className="[stroke-dashoffset:1] motion-reduce:animation-none"
              style={{
                animation: `stroke-draw 0.4s var(--ease-out-expo) ${index * 80}ms both`,
              }}
            />
          </svg>
        ) : state === PHASE_STEP_STATE.active ? (
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
        ) : (
          <span className="font-body text-[10px] font-bold">{index + 1}</span>
        )}
      </div>
      <span
        className={cn(
          'font-body text-[10px] font-medium transition-colors duration-300',
          state === PHASE_STEP_STATE.active
            ? 'text-primary'
            : state === PHASE_STEP_STATE.done
              ? 'text-on-surface-variant'
              : 'text-on-surface-variant/40',
        )}
      >
        {label}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface PhaseProgressProps {
  phaseIndex: number
}

export function PhaseProgress({ phaseIndex }: PhaseProgressProps) {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  // Progress bar width: go from 0% (phase 0) to 100% (last phase done)
  const progressPct =
    PHASE_LABELS.length <= 1
      ? 0
      : Math.round((phaseIndex / (PHASE_LABELS.length - 1)) * 100)

  return (
    <output
      className="flex flex-col gap-5 pt-1"
      aria-live="polite"
      aria-label="Estado de procesamiento"
    >
      {/* Step dots + connecting bar */}
      <div className="relative flex items-start justify-between">
        {/* Background track */}
        <div
          aria-hidden="true"
          className="absolute top-4 left-4 right-4 z-0 h-0.5 -translate-y-1/2 rounded-full bg-outline-variant"
        />
        {/* Filled track */}
        <div
          aria-hidden="true"
          className="absolute top-4 left-4 z-0 h-0.5 -translate-y-1/2 rounded-full bg-primary transition-all duration-700"
          style={{
            width: `calc(${progressPct}% * (100% - 2rem) / 100)`,
          }}
        />
        {PHASE_LABELS.map((label, i) => (
          <StepDot
            key={label}
            label={label}
            fullLabel={PHASE_LABELS_FULL[i]}
            index={i}
            state={
              i < phaseIndex
                ? PHASE_STEP_STATE.done
                : i === phaseIndex
                  ? PHASE_STEP_STATE.active
                  : PHASE_STEP_STATE.pending
            }
          />
        ))}
      </div>

      {/* Rotating message */}
      <p
        aria-atomic="true"
        className="text-center font-body text-sm text-on-surface-variant transition-opacity duration-300"
      >
        {LOADING_MESSAGES[msgIndex]}
      </p>
    </output>
  )
}
