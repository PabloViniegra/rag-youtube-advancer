'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  CloseIcon,
  HomeIcon,
  LogOutIcon,
  SearchIcon,
  SettingsIcon,
  VideoIcon,
} from '@/components/dashboard/icons'
import { signOut } from '@/lib/auth/actions'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: HomeIcon },
  { href: '/dashboard/videos', label: 'Mis videos', icon: VideoIcon },
  { href: '/dashboard/search', label: 'Buscar', icon: SearchIcon },
  { href: '/dashboard/settings', label: 'Ajustes', icon: SettingsIcon },
] as const

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

interface LandingMobileDrawerProps {
  isAuthenticated: boolean
  closing: boolean
  pathname: string
  onClose: () => void
}

export function LandingMobileDrawer({
  isAuthenticated,
  closing,
  pathname,
  onClose,
}: LandingMobileDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const drawer = drawerRef.current
    if (!drawer) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const drawerEl = drawerRef.current
      if (!drawerEl) return

      const els = Array.from(drawerEl.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (els.length === 0) return

      const first = els[0]
      const last = els[els.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-on-surface/60 md:hidden',
          closing ? 'animate-fade-out' : 'animate-fade-in',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <nav
        id="mobile-nav-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú móvil"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[calc(100vw-3rem)] flex-col bg-surface-container-low md:hidden border-r border-outline-variant',
          closing ? 'animate-slide-out-left' : 'animate-slide-in-left',
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-5">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
          >
            <div className="h-8 w-1 shrink-0 rounded-full bg-primary" />
            <div className="flex flex-col leading-none">
              <span className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">
                YouTube
              </span>
              <span className="font-headline text-base font-extrabold text-on-surface">
                Intelligence
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Cerrar menú"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mx-5 h-px bg-outline-variant" />

        {/* Nav links */}
        <div className="flex flex-1 flex-col gap-0.5 px-3 py-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }, i) => {
            const isActive =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'animate-fade-up stagger-item flex items-center gap-3 rounded-lg px-3 py-3 font-body text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                )}
                style={{ '--i': i } as React.CSSProperties}
              >
                <Icon />
                {label}
              </Link>
            )
          })}
        </div>

        {/* CTA + Logout */}
        <div className="p-3 space-y-2">
          <Link
            href={isAuthenticated ? '/dashboard' : '/login'}
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-lg bg-primary px-3 py-3 font-headline font-bold text-sm text-on-primary transition-all hover:bg-primary-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {isAuthenticated ? 'Ir al Dashboard' : 'Iniciar sesión'}
          </Link>
          {isAuthenticated && (
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-body text-sm font-semibold text-on-surface-variant transition-all hover:bg-error-container/60 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <LogOutIcon />
                Cerrar sesión
              </button>
            </form>
          )}
        </div>
      </nav>
    </>
  )
}
