'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { HamburgerIcon } from './icons'
import { MobileDrawer } from './mobile-drawer'

interface DashboardTopbarProps {
  displayName: string
}

export function DashboardTopbar({ displayName }: DashboardTopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  // closing = true while exit animation plays before unmounting
  const [closing, setClosing] = useState(false)
  const pathname = usePathname()
  const openBtnRef = useRef<HTMLButtonElement>(null)

  // Close with exit-animation, then unmount
  const closeMenu = useCallback(() => {
    setClosing(true)
    const timer = setTimeout(() => {
      setMenuOpen(false)
      setClosing(false)
      openBtnRef.current?.focus()
    }, 200) // matches animate-slide-out-left duration
    return () => clearTimeout(timer)
  }, [])

  // Close immediately on route change (new page is already rendered)
  useEffect(() => {
    if (!pathname) return
    setMenuOpen(false)
    setClosing(false)
  }, [pathname])

  return (
    <>
      {/* ── Desktop topbar ── */}
      <header
        className="hidden h-12 items-center justify-between border-b border-outline-variant bg-background px-6 md:flex"
        style={{ viewTransitionName: 'dashboard-topbar' }}
      >
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
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-surface-variant/60 transition-colors hover:bg-inverse-on-surface/10 hover:text-inverse-on-surface"
            aria-label="Abrir menú de navegación"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
          >
            <HamburgerIcon />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer (only in DOM when open or closing) ── */}
      {(menuOpen || closing) && (
        <MobileDrawer
          displayName={displayName}
          closing={closing}
          pathname={pathname}
          onClose={closeMenu}
        />
      )}
    </>
  )
}
