'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import type { VideoSectionStats } from '../actions'
import { getVideoSectionStats } from '../actions'

const CLOSE_ANIMATION_MS = 150

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

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
    }
  }, [text])

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex items-center gap-1 font-mono text-xs text-on-surface transition-colors hover:text-primary"
      aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
      title={copied ? `${label} copiado` : `Copiar ${label}`}
    >
      <span className="bg-surface-container rounded px-1.5 py-0.5">{text}</span>
      <span
        className={`transition-all duration-200 ${
          copied
            ? 'opacity-100 text-success'
            : 'opacity-0 group-hover:opacity-100'
        }`}
        aria-hidden="true"
      >
        {copied ? '✓' : '📋'}
      </span>
    </button>
  )
}

export function VideoPropertiesModal({
  videoId,
  videoTitle,
  youtubeId,
  createdAt,
  onClose,
}: VideoPropertiesModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isPending, startTransition] = useTransition()
  const [stats, setStats] = useState<VideoSectionStats | null>(null)
  const [statsError, setStatsError] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
    closeTimerRef.current = setTimeout(onClose, CLOSE_ANIMATION_MS)
  }, [isClosing, onClose])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    dialog.showModal()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    dialog.addEventListener('keydown', handleKeyDown)

    return () => {
      dialog.removeEventListener('keydown', handleKeyDown)
      dialog.close()
    }
  }, [handleClose])

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
    if (e.target === dialogRef.current) handleClose()
  }

  const isLoading = isPending && !stats
  const hasError = !isPending && statsError
  const sectionCount = stats?.sectionCount ?? 0
  const contentSize = stats?.contentSizeChars ?? 0

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby="properties-modal-title"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleClose()
      }}
      onCancel={(e) => {
        e.preventDefault()
        handleClose()
      }}
      className={`m-auto w-full max-w-md rounded-2xl border border-outline-variant bg-surface p-6 shadow-xl backdrop:bg-inverse-surface/40 ${
        isClosing
          ? 'animate-out fade-out zoom-out-95 duration-150'
          : 'animate-in fade-in zoom-in-95 duration-200'
      }`}
    >
      <div className="mb-5 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary-container">
          <VideoIcon />
        </div>
        <h2
          id="properties-modal-title"
          className="font-headline text-lg font-bold text-on-surface"
        >
          Propiedades del video
        </h2>
      </div>

      <dl className="space-y-4">
        <PropRow
          label="Título"
          value={
            <span className="font-body text-sm font-medium text-on-surface">
              {videoTitle ?? 'Sin título'}
            </span>
          }
          valueClass="text-left"
        />
        <div className="border-t border-outline-variant" />
        <PropRow
          label="YouTube"
          value={<CopyButton text={youtubeId} label="YouTube ID" />}
        />
        <PropRow
          label="Enlace"
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
        <PropRow label="Indexado" value={formatDate(createdAt)} />
        <div className="border-t border-outline-variant" />
        <div className="flex gap-6">
          <div className="flex-1">
            <dt className="font-body text-xs uppercase tracking-wide text-on-surface-variant">
              Secciones
            </dt>
            <dd
              className={`font-headline text-2xl font-bold ${
                hasError ? 'text-error' : 'text-on-surface'
              }`}
            >
              {isLoading ? '…' : hasError ? '—' : sectionCount}
            </dd>
          </div>
          <div className="flex-1">
            <dt className="font-body text-xs uppercase tracking-wide text-on-surface-variant">
              Tamaño
            </dt>
            <dd className="font-body text-sm font-medium text-on-surface">
              {isLoading ? '…' : hasError ? '—' : formatSize(contentSize)}
            </dd>
          </div>
        </div>
        <div className="border-t border-outline-variant" />
        <PropRow
          label="ID interno"
          value={<CopyButton text={videoId} label="ID interno" />}
        />
      </dl>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleClose}
          className="h-9 rounded-lg px-4 font-body text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline"
        >
          Cerrar
        </button>
      </div>
    </dialog>
  )
}

function PropRow({
  label,
  value,
  valueClass = 'text-right',
}: {
  label: string
  value: React.ReactNode
  valueClass?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 font-body text-sm text-on-surface-variant">
        {label}
      </dt>
      <dd className={`font-body text-sm text-on-surface ${valueClass}`}>
        {value}
      </dd>
    </div>
  )
}

function VideoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5 text-on-primary-container"
      aria-hidden="true"
    >
      <path d="M4 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1.5v13l9-6.5-9-6.5z" />
    </svg>
  )
}
