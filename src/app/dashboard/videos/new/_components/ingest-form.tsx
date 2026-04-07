'use client'

/**
 * IngestForm
 *
 * Form card for ingesting a YouTube video.
 * Sub-components (fields, icons) are in ./ingest-form-fields.tsx.
 */

import {
  ErrorBanner,
  SubmitButton,
  TitleField,
  UrlField,
} from './ingest-form-fields'
import { PhaseProgress } from './phase-progress'

// ── Types ─────────────────────────────────────────────────────────────────────

interface IngestFormProps {
  url: string
  title: string
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  phaseIndex: number
  onUrlChange: (v: string) => void
  onTitleChange: (v: string) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function IngestForm({
  url,
  title,
  isLoading,
  isError,
  errorMessage,
  phaseIndex,
  onUrlChange,
  onTitleChange,
  onSubmit,
}: IngestFormProps) {
  return (
    <section
      aria-labelledby="form-heading"
      className="flex flex-col gap-6 rounded-2xl border border-outline-variant bg-background p-6 shadow-sm"
    >
      <h2 id="form-heading" className="sr-only">
        Formulario de ingesta
      </h2>

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <UrlField value={url} onChange={onUrlChange} disabled={isLoading} />
        <TitleField
          value={title}
          onChange={onTitleChange}
          disabled={isLoading}
        />

        {isError && errorMessage && <ErrorBanner message={errorMessage} />}

        {isLoading ? (
          <PhaseProgress phaseIndex={phaseIndex} />
        ) : (
          <SubmitButton disabled={!url.trim()} />
        )}
      </form>
    </section>
  )
}
