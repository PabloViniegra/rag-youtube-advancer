'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
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
  const [confirmText, setConfirmText] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const canDelete =
    confirmText.toLowerCase() === videoTitle?.toLowerCase() ||
    confirmText.toLowerCase() === 'eliminar' ||
    confirmText.toLowerCase() === 'delete'

  const handleConfirm = useCallback(() => {
    if (!canDelete) return

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
  }, [canDelete, videoId, onDeleteOptimistic, onClose])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
      if (e.key === 'Enter' && canDelete && !isPending) {
        e.preventDefault()
        handleConfirm()
      }
    },
    [onClose, canDelete, isPending, handleConfirm],
  )

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    dialog.showModal()
    dialog.addEventListener('keydown', handleKeyDown)
    setTimeout(() => inputRef.current?.focus(), 50)

    return () => {
      dialog.removeEventListener('keydown', handleKeyDown)
      dialog.close()
    }
  }, [handleKeyDown])

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose()
        }
      }}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      className="m-auto w-full max-w-sm rounded-2xl border border-outline-variant bg-surface p-6 shadow-xl backdrop:bg-inverse-surface/40 animate-in fade-in zoom-in-95 duration-200 animate-out fade-out zoom-out-95 duration-150"
    >
      <div className="mb-1 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-error/10">
          <DangerIcon />
        </div>
        <h2
          id="delete-modal-title"
          className="font-headline text-lg font-bold text-on-surface"
        >
          Eliminar video
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
      <ul className="mb-5 space-y-1.5">
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

      <div className="mb-5 rounded-lg bg-error/5 p-3">
        <label
          htmlFor="delete-confirm"
          className="mb-1.5 block font-body text-xs font-medium text-on-surface-variant"
        >
          Escribe{' '}
          <code className="font-mono text-error">
            "{videoTitle || 'eliminar'}"
          </code>{' '}
          para confirmar
        </label>
        <input
          ref={inputRef}
          id="delete-confirm"
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={isPending}
          placeholder={videoTitle || 'eliminar'}
          className="w-full rounded-md border border-error/30 bg-surface px-3 py-2 font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-error focus:outline-none focus:ring-1 focus:ring-error disabled:opacity-50"
          autoComplete="off"
          aria-describedby="delete-confirm-hint"
        />
        <p
          id="delete-confirm-hint"
          className="mt-1.5 font-body text-xs text-on-surface-variant"
        >
          Este cambio no se puede deshacer.
        </p>
      </div>

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
          type="button"
          onClick={handleConfirm}
          disabled={!canDelete || isPending}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-error px-4 font-body text-sm font-semibold text-on-error transition-colors hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? <SpinnerIcon /> : null}
          {isPending ? 'Eliminando…' : 'Sí, eliminar'}
        </button>
      </div>
    </dialog>
  )
}

function DangerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5 shrink-0 text-error"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-8h2v6h-2V9z" />
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
