'use client'

import { useState, startTransition, ViewTransition } from 'react'
import { DeleteVideoModal } from './delete-video-modal'

interface VideoCardActionsProps {
  videoId: string
  videoTitle: string | null
  onDeleteOptimistic: () => void
}

export function VideoCardActions({
  videoId,
  videoTitle,
  onDeleteOptimistic,
}: VideoCardActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  function handleDeleteClick() {
    // Wrap in startTransition: closes menu (exit VT) and opens modal (enter VT)
    startTransition(() => {
      setMenuOpen(false)
      setModalOpen(true)
    })
  }

  function handleMenuToggle() {
    startTransition(() => setMenuOpen((prev) => !prev))
  }

  function handleMenuClose() {
    startTransition(() => setMenuOpen(false))
  }

  function handleModalClose() {
    startTransition(() => setModalOpen(false))
  }

  return (
    <>
      {/* ⋮ trigger — positioned absolute by the parent VideoGrid */}
      <div className="relative">
        <button
          type="button"
          aria-label="Más opciones"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={handleMenuToggle}
          className="flex size-8 items-center justify-center rounded-full bg-surface/80 text-on-surface-variant backdrop-blur-sm transition-colors hover:bg-surface hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <DotsIcon />
        </button>

        {menuOpen && (
          <>
            {/* Click-outside overlay */}
            <div
              className="fixed inset-0 z-10"
              onClick={handleMenuClose}
              aria-hidden="true"
            />
            {/* Dropdown panel — animates enter/exit */}
            <ViewTransition enter="fade-in" exit="fade-out" default="none">
              <div
                role="menu"
                className="absolute right-0 top-9 z-20 min-w-[160px] rounded-xl border border-outline-variant bg-surface py-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleDeleteClick}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 font-body text-sm text-error transition-colors hover:bg-error-container focus-visible:bg-error-container focus-visible:outline-none"
                >
                  <TrashIcon />
                  Eliminar video
                </button>
              </div>
            </ViewTransition>
          </>
        )}
      </div>

      {/* Modal — mounted/unmounted by the parent so ViewTransition can animate */}
      {modalOpen && (
        <ViewTransition enter="fade-in" exit="fade-out" default="none">
          <DeleteVideoModal
            videoId={videoId}
            videoTitle={videoTitle}
            onClose={handleModalClose}
            onDeleteOptimistic={onDeleteOptimistic}
          />
        </ViewTransition>
      )}
    </>
  )
}

function DotsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-4 shrink-0"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
        clipRule="evenodd"
      />
    </svg>
  )
}
