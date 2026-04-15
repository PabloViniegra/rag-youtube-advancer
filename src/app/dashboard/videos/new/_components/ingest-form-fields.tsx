/**
 * IngestForm field sub-components and icons.
 * Extracted from ingest-form.tsx to keep each file under 200 lines.
 */

// ── Icons ─────────────────────────────────────────────────────────────────────

export function YouTubeIcon() {
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

export function SparkIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
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

// ── Field types ───────────────────────────────────────────────────────────────

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

// ── Fields ────────────────────────────────────────────────────────────────────

export function UrlField({ value, onChange, disabled }: UrlFieldProps) {
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

export function TitleField({ value, onChange, disabled }: TitleFieldProps) {
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

export function ErrorBanner({ message }: { message: string }) {
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

export function SubmitButton({ disabled }: { disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="btn-cta group w-full inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-4 font-body text-base font-semibold text-on-primary shadow-[0_4px_20px_-4px_color-mix(in_oklch,var(--color-primary)_50%,transparent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
    >
      <SparkIcon className="transition-[transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:rotate-[15deg] group-hover:scale-[1.25]" />
      Analizar video
    </button>
  )
}
