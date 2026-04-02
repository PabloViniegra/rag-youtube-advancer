import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface NavbarProps {
  isAuthenticated: boolean
}

export function Navbar({ isAuthenticated }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-outline-variant/40">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <div className="text-xl font-extrabold tracking-tighter text-on-surface uppercase font-headline">
          YouTube Intelligence
        </div>

        <div className="hidden md:flex gap-8 items-center">
          <a
            className="font-body text-sm font-semibold text-primary border-b-2 border-primary pb-0.5"
            href="#features"
          >
            Features
          </a>
          <a
            className="font-body text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors duration-200"
            href="#pricing"
          >
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="bg-primary text-on-primary px-5 py-2 rounded-lg font-headline font-bold text-sm transition-all hover:bg-primary-dim active:scale-95"
            >
              Ir al Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="border border-primary text-primary px-5 py-2 rounded-lg font-headline font-bold text-sm transition-all hover:bg-primary hover:text-on-primary active:scale-95"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
