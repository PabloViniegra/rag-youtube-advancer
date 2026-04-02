import { signOut } from '@/lib/auth/actions'
import {
  HomeIcon,
  LogOutIcon,
  SearchIcon,
  SettingsIcon,
  VideoIcon,
} from './icons'
import { NavItem } from './nav-item'
import { UserAvatar } from './user-avatar'

interface DashboardSidebarProps {
  displayName: string
  email: string
  avatarUrl?: string
}

export function DashboardSidebar({
  displayName,
  email,
  avatarUrl,
}: DashboardSidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-outline-variant bg-background md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-outline-variant px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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
        <span className="font-headline text-sm font-extrabold text-on-surface">
          YT Intelligence
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Principal">
        <NavItem href="/dashboard" label="Inicio" icon={HomeIcon} />
        <NavItem href="/dashboard/videos" label="Mis videos" icon={VideoIcon} />
        <NavItem href="/dashboard/buscar" label="Buscar" icon={SearchIcon} />
        <NavItem
          href="/dashboard/ajustes"
          label="Ajustes"
          icon={SettingsIcon}
        />
      </nav>

      {/* User footer */}
      <div className="border-t border-outline-variant p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <UserAvatar name={displayName} avatarUrl={avatarUrl} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-body text-sm font-semibold text-on-surface">
              {displayName}
            </p>
            <p className="truncate font-body text-xs text-on-surface-variant">
              {email}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOutIcon />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
