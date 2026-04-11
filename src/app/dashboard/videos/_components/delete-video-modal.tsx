'use client'

import { useEffect, useRef, useTransition } from 'react'
import { sileo } from 'sileo'
import { deleteVideo } from '../actions'

interface DeleteVideoModalProps {
  videoId: string
  videoTitle: string | null
  onClose: () => void
  onDeleteOptimistic: () => void
}

const IMPACT_ITEMS = [
  'Transcripción y secciones vectoriales',
  'Informe de inteligencia',
  'Registro del video',
] as const

export function DeleteVideoModal({
  videoId,
  videoTitle,
  onClose,
  onDeleteOptimistic,
}: DeleteVideoModalProps) {
  const [isPending, startTransition] = useTransition()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

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
    confirmButtonRef.current?.focus()

    return () => {
      dialog.removeEventListener('keydown', handleKeyDown)
      dialog.close()
    }
  }, [onClose])

  function handleConfirm() {
    startTransition(async () => {
      onDeleteOptimistic()
      onClose()
      const result = await deleteVideo(videoId)
      if (result.error) {
        sileo.error({
          title: 'No se pudo eliminar',
          description: result.error,
        })
      } else {
        sileo.success({
          title: 'Video eliminado',
          description: 'Todos los datos asociados han sido borrados.',
        })
      }
    })
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={handleBackdropClick}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }}
      className="m-auto rounded-2xl border border-outline-variant bg-surface p-6 shadow-xl backdrop:bg-inverse-surface/40"
    >
      <div className="mb-1 flex items-center gap-2">
        <WarningIcon />
        <h2
          id="delete-modal-title"
          className="font-headline text-base font-bold text-on-surface"
        >
          Desindexar video
        </h2>
      </div>

      {videoTitle && (
        <p className="mb-4 font-body text-sm italic text-on-surface-variant">
          "{videoTitle}"
        </p>
      )}

      <p className="mb-3 font-body text-xs text-on-surface-variant">
        Se eliminará permanentemente:
      </p>
      <ul className="mb-6 space-y-1.5">
        {IMPACT_ITEMS.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 font-body text-xs text-error"
          >
            <XIcon />
            {item}
          </li>
        ))}
      </ul>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="h-9 rounded-lg px-4 font-body text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          ref={confirmButtonRef}
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-error px-4 font-body text-sm font-semibold text-on-error transition-colors hover:bg-error/90 disabled:opacity-70"
        >
          {isPending ? <SpinnerIcon /> : null}
          {isPending ? 'Eliminando…' : 'Sí, eliminar'}
        </button>
      </div>
    </dialog>
  )
}

function WarningIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5 shrink-0 text-error"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="size-3.5 shrink-0"
      aria-hidden="true"
    >
      <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg
      className="size-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
