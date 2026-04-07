/**
 * PipelineHint
 *
 * Visual hint that communicates the 5-phase ingestion pipeline to the user
 * before they submit the form. Reinforces the value proposition.
 * Server Component — no interactivity needed.
 *
 * Step data is in ./pipeline-steps.tsx.
 */

import { PIPELINE_STEPS } from './pipeline-steps'

export function PipelineHint() {
  return (
    <ol
      aria-label="Proceso de análisis del video"
      className="flex flex-wrap items-center gap-x-1 gap-y-3"
    >
      {PIPELINE_STEPS.map((step, i) => (
        <li key={step.label} className="flex items-center gap-1">
          <div
            className="flex animate-fade-up flex-col items-center gap-1.5 stagger-item"
            style={{ '--i': i } as React.CSSProperties}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary-container">
              {step.icon}
            </div>
            <span className="font-body text-[10px] font-medium text-on-surface-variant">
              {step.label}
            </span>
          </div>
          {i < PIPELINE_STEPS.length - 1 && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="mb-4 shrink-0 text-outline-variant"
            >
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </li>
      ))}
    </ol>
  )
}
