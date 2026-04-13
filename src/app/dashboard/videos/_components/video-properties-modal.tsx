'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import type { VideoSectionStats } from '../actions'
import { getVideoSectionStats } from '../actions'

interface VideoPropertiesModalProps {
  videoId: string
  videoTitle: string | null
  youtubeId: string
  createdAt: string
  onClose: () => void
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

function formatSize(chars: number): string {
  if (chars < 1000) return `${chars} car.`
  return `${(chars / 1000).toFixed(1)} K car.`
}

export function VideoPropertiesModal({
  videoId,
  videoTitle,
  youtubeId,
  createdAt,
  onClose,
}: VideoPropertiesModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isPending, startTransition] = useTransition()
  const [stats, setStats] = useState<VideoSectionStats | null>(null)
  const [statsError, setStatsError] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    dialog.showModal()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    dialog.addEventListener('keydown', handleKeyDown)

    return () => {
      dialog.removeEventListener('keydown', handleKeyDown)
      dialog.close()
    }
  }, [onClose])

  useEffect(() => {
    startTransition(async () => {
      const result = await getVideoSectionStats(videoId)
      if (result.data) {
        setStats(result.data)
      } else {
        setStatsError(true)
      }
    })
  }, [videoId])

  const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby="properties-modal-title"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      className="m-auto w-full max-w-md rounded-2xl border border-outline-variant bg-surface p-6 shadow-xl backdrop:bg-inverse-surface/40"
    >
      <div className="mb-5 flex items-center gap-2">
        <InfoIcon />
        <h2
          id="properties-modal-title"
          className="font-headline text-base font-bold text-on-surface"
        >
          Propiedades del video
        </h2>
      </div>

      <dl className="space-y-3.5">
        <PropRow label="Título" value={videoTitle ?? 'Sin título'} />
        <PropRow
          label="YouTube ID"
          value={
            <code className="rounded bg-surface-container px-1.5 py-0.5 font-mono text-xs text-on-surface">
              {youtubeId}
            </code>
          }
        />
        <PropRow
          label="Localización"
          value={
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm text-primary underline-offset-2 hover:underline"
            >
              Ver en YouTube ↗
            </a>
          }
        />
        <PropRow label="Indexado el" value={formatDate(createdAt)} />
        <PropRow
          label="Secciones"
          value={
            isPending
              ? '…'
              : statsError
                ? '—'
                : String(stats?.sectionCount ?? 0)
          }
        />
        <PropRow
          label="Tamaño aprox."
          value={
            isPending
              ? '…'
              : statsError
                ? '—'
                : formatSize(stats?.contentSizeChars ?? 0)
          }
        />
        <PropRow
          label="ID interno"
          value={
            <code className="rounded bg-surface-container px-1.5 py-0.5 font-mono text-xs text-on-surface">
              {videoId.slice(0, 8)}…
            </code>
          }
        />
      </dl>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="h-9 rounded-lg px-4 font-body text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline"
        >
          Cerrar
        </button>
      </div>
    </dialog>
  )
}

function PropRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="shrink-0 font-body text-sm text-on-surface-variant">
        {label}
      </dt>
      <dd className="text-right font-body text-sm text-on-surface">{value}</dd>
    </div>
  )
}

function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5 shrink-0 text-primary"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  )
}
