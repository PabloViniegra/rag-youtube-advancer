'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { signOut } from '@/lib/auth/actions'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  LogOutIcon,
  SearchIcon,
  SettingsIcon,
  VideoIcon,
} from './icons'

interface DashboardTopbarProps {
  displayName: string
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: HomeIcon },
  { href: '/dashboard/videos', label: 'Mis videos', icon: VideoIcon },
  { href: '/dashboard/search', label: 'Buscar', icon: SearchIcon },
  { href: '/dashboard/settings', label: 'Ajustes', icon: SettingsIcon },
] as const

// Focusable element selector for focus-trap
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function DashboardTopbar({ displayName }: DashboardTopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  // closing = true while the exit animation plays
  const [closing, setClosing] = useState(false)
  const pathname = usePathname()
  const drawerRef = useRef<HTMLElement>(null)
  const openBtnRef = useRef<HTMLButtonElement>(null)

  // Close with exit-animation then unmount
  const closeMenu = useCallback(() => {
    setClosing(true)
    const timer = setTimeout(() => {
      setMenuOpen(false)
      setClosing(false)
      openBtnRef.current?.focus()
    }, 200) // matches animate-slide-out-left duration
    return () => clearTimeout(timer)
  }, [])

  // Close on route change — skip exit animation, new page is already rendered
  useEffect(() => {
    if (!pathname) return
    setMenuOpen(false)
    setClosing(false)
  }, [pathname])

  // Escape key + focus trap
  useEffect(() => {
    if (!menuOpen) return

    const drawer = drawerRef.current
    if (!drawer) return

    // Move focus into drawer
    const focusables = Array.from(
      drawer.querySelectorAll<HTMLElement>(FOCUSABLE),
    )
    focusables[0]?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeMenu()
        return
      }
      if (e.key !== 'Tab') return

      const focusableEls = Array.from(
        drawer!.querySelectorAll<HTMLElement>(FOCUSABLE),
      )
      if (focusableEls.length === 0) return

      const first = focusableEls[0]
      const last = focusableEls[focusableEls.length - 1]

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
  }, [menuOpen, closeMenu])

  return (
    <>
      {/* ── Desktop topbar ── */}
      <header className="hidden h-12 items-center justify-between border-b border-outline-variant bg-background px-6 md:flex">
        <p className="font-body text-sm text-on-surface-variant">
          Hola,{' '}
          <span className="font-semibold text-on-surface">{displayName}</span>
        </p>
        <ThemeToggle />
      </header>

      {/* ── Mobile topbar ── */}
      <header className="flex h-14 items-center justify-between bg-on-surface px-4 md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-0.5 rounded-full bg-primary" />
          <span className="font-headline text-sm font-extrabold text-inverse-on-surface">
            Intelligence
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            ref={openBtnRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-surface-variant/60 transition-colors hover:bg-inverse-on-surface/10 hover:text-inverse-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Abrir menú de navegación"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
          >
            <HamburgerIcon />
          </button>
        </div>
      </header>

      {/* ── Mobile nav drawer — always in DOM when open or closing ── */}
      {(menuOpen || closing) && (
        <>
          {/* Backdrop — fade in/out */}
          <div
            className={cn(
              'fixed inset-0 z-40 bg-on-surface/60 md:hidden',
              closing ? 'animate-fade-out' : 'animate-fade-in',
            )}
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Drawer — slide in/out from left */}
          <nav
            id="mobile-nav-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú móvil"
            className={cn(
              'fixed inset-y-0 left-0 z-50 flex w-64 max-w-[calc(100vw-3rem)] flex-col bg-on-surface md:hidden',
              closing ? 'animate-slide-out-left' : 'animate-slide-in-left',
            )}
          >
            {/* Drawer header */}
            <div className="flex h-14 items-center justify-between px-5">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-0.5 rounded-full bg-primary" />
                <div className="flex flex-col leading-none">
                  <span className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">
                    YouTube
                  </span>
                  <span className="font-headline text-sm font-extrabold text-inverse-on-surface">
                    Intelligence
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-surface-variant/60 transition-colors hover:bg-inverse-on-surface/10 hover:text-inverse-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label="Cerrar menú"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mx-5 h-px bg-inverse-on-surface/10" />

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
                    onClick={closeMenu}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'animate-fade-up stagger-item flex items-center gap-3 rounded-lg px-3 py-3 font-body text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      isActive
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant/70 hover:bg-inverse-on-surface/8 hover:text-inverse-on-surface',
                    )}
                    style={{ '--i': i } as React.CSSProperties}
                  >
                    <Icon />
                    {label}
                  </Link>
                )
              })}
            </div>

            {/* Logout */}
            <div className="p-3">
              <div className="mb-2 border-t border-inverse-on-surface/10 pt-3">
                <p className="px-3 font-body text-xs text-on-surface-variant/60">
                  {displayName}
                </p>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-body text-sm font-semibold text-on-surface-variant/70 transition-all hover:bg-error-container/60 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <LogOutIcon />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </nav>
        </>
      )}
    </>
  )
}

function HamburgerIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
