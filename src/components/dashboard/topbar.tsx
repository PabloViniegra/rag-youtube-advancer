import { ThemeToggle } from '@/components/ui/theme-toggle'
import { signOut } from '@/lib/auth/actions'
import { LogOutIcon } from './icons'

interface DashboardTopbarProps {
  displayName: string
}

export function DashboardTopbar({ displayName: _ }: DashboardTopbarProps) {
  return (
    <>
      {/* Desktop topbar — top-right of main content area */}
      <header className="hidden md:flex h-12 items-center justify-end border-b border-outline-variant bg-background px-6 gap-3">
        <ThemeToggle />
      </header>

      {/* Mobile topbar */}
      <header className="flex h-14 items-center justify-between border-b border-outline-variant bg-background px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z"
                stroke="white"
                strokeWidth="1.5"
              />
              <path d="m10 8 6 4-6 4V8Z" fill="white" />
            </svg>
          </div>
          <span className="font-headline text-sm font-bold text-on-surface">
            YT Intelligence
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Cerrar sesión"
            >
              <LogOutIcon />
            </button>
          </form>
        </div>
      </header>
    </>
  )
}
