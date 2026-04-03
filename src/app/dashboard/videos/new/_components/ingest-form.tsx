'use client'

/**
 * IngestForm
 *
 * Form card for ingesting a YouTube video.
 * Features:
 *  - URL field with a YouTube icon prefix
 *  - Optional title field
 *  - Error banner (shown when state = error)
 *  - Full-width submit button with spark icon
 *  - Loading state replaced by PhaseProgress (injected via children/props)
 */

import { cn } from '@/lib/utils'
import { PhaseProgress } from './phase-progress'

// ── Types ─────────────────────────────────────────────────────────────────────

interface UrlFieldProps {
  value: string
  onChange: (v: string) => void
  disabled: boolean
}

interface TitleFieldProps {
  value: string
  onChange: (v: string) => void
  disabled: boolean
}

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

// ── YouTube icon ──────────────────────────────────────────────────────────────

function YouTubeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0 text-error"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

// ── Spark icon (submit button) ────────────────────────────────────────────────

function SparkIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  )
}

// ── URL field ─────────────────────────────────────────────────────────────────

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
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 flex items-center">
          <YouTubeIcon />
        </span>
        <input
          id="youtube-url"
          type="url"
          required
          placeholder="https://www.youtube.com/watch?v=..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-describedby="youtube-url-hint"
          className="w-full rounded-xl border border-outline-variant bg-surface-container-low py-3 pr-4 pl-10 font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <p
        id="youtube-url-hint"
        className="font-body text-xs text-on-surface-variant"
      >
        Admite URLs estándar, cortas (youtu.be) y con timestamp.
      </p>
    </div>
  )
}

// ── Title field ───────────────────────────────────────────────────────────────

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

// ── Submit button ─────────────────────────────────────────────────────────────

function SubmitButton({ disabled }: { disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-body text-base font-semibold text-on-primary transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <SparkIcon />
      Analizar video
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

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
