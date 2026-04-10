import Link from 'next/link'
import { NavLinks } from '@/components/landing/nav-links'
import { GitHubStarButton } from '@/components/ui/github-star-button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface NavbarProps {
  isAuthenticated: boolean
}

export function Navbar({ isAuthenticated }: NavbarProps) {
  return (
    <>
      {/* Skip link — first focusable element on the page (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="fixed left-2 top-2 z-[100] -translate-y-16 rounded-lg bg-primary px-4 py-2 font-body text-sm font-bold text-on-primary shadow-lg transition-transform focus:translate-y-0 focus-visible:translate-y-0"
      >
        Saltar al contenido principal
      </a>

      <nav
        aria-label="Principal"
        className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-outline-variant/40"
      >
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          {/* Brand — link to home (convention + usability) */}
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tighter text-on-surface uppercase font-headline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
          >
            YouTube Intelligence
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
    </>
  )
}
