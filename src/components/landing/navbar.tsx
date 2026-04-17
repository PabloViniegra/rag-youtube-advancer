'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { HamburgerIcon } from '@/components/dashboard/icons'
import { LandingMobileDrawer } from '@/components/landing/landing-mobile-drawer'
import { NavLinks } from '@/components/landing/nav-links'
import { GitHubStarButton } from '@/components/ui/github-star-button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface NavbarProps {
  isAuthenticated: boolean
}

export function Navbar({ isAuthenticated }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const pathname = usePathname()
  const openBtnRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback(() => {
    setClosing(true)
    const timer = setTimeout(() => {
      setMenuOpen(false)
      setClosing(false)
      openBtnRef.current?.focus()
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!pathname) return
    setMenuOpen(false)
    setClosing(false)
  }, [pathname])

  return (
    <>
      {/* Skip link */}
      <a
        href="#main-content"
        className="fixed left-2 top-2 z-[100] -translate-y-16 rounded-lg bg-primary px-4 py-2 font-body text-sm font-bold text-on-primary shadow-lg transition-transform focus:translate-y-0 focus-visible:translate-y-0 sr-only focus:not:sr-only"
        suppressHydrationWarning
      >
        Saltar al contenido principal
      </a>

      {/* Desktop nav */}
      <nav
        aria-label="Principal"
        className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-outline-variant/40 hidden md:block"
      >
        <div className="flex justify-between items-center px-6 lg:px-8 py-4 max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-lg lg:text-xl font-extrabold tracking-tighter text-on-surface uppercase font-headline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
          >
            Second Brain
          </Link>

          <NavLinks />

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <GitHubStarButton />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="bg-primary text-on-primary px-5 py-2 rounded-lg font-headline font-bold text-sm transition-all hover:bg-primary-dim active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Ir al Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="border border-primary text-primary px-5 py-2 rounded-lg font-headline font-bold text-sm transition-all hover:bg-primary hover:text-on-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      <nav
        aria-label="Principal"
        className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-outline-variant/40 md:hidden"
      >
        <div className="flex justify-between items-center px-4 py-3">
          <Link
            href="/"
            className="text-base font-extrabold tracking-tight text-on-surface uppercase font-headline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
          >
            Second Brain
          </Link>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              ref={openBtnRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Abrir menú de navegación"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-drawer"
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {(menuOpen || closing) && (
        <LandingMobileDrawer
          isAuthenticated={isAuthenticated}
          closing={closing}
          pathname={pathname}
          onClose={closeMenu}
        />
      )}
    </>
  )
}
