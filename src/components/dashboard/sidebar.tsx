'use client'

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
    <aside
      className="hidden w-56 shrink-0 flex-col bg-on-surface md:flex"
      style={{ viewTransitionName: 'dashboard-sidebar' }}
    >
      {/* ── Brand mark ── */}
      <div className="flex h-16 items-center gap-3 px-5">
        {/* Crimson accent bar */}
        <div className="h-8 w-1 shrink-0 rounded-full bg-primary" />
        <div className="min-w-0 flex flex-col leading-none">
          <span className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">
            YouTube
          </span>
          <span className="font-headline text-base font-extrabold text-inverse-on-surface">
            Intelligence
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-5 h-px bg-inverse-on-surface/10" />

      {/* ── Nav ── */}
      <nav
        className="flex flex-1 flex-col gap-0.5 px-3 py-4"
        aria-label="Principal"
      >
        <NavItem href="/dashboard" label="Inicio" icon={HomeIcon} />
        <NavItem href="/dashboard/videos" label="Mis videos" icon={VideoIcon} />
        <NavItem href="/dashboard/search" label="Buscar" icon={SearchIcon} />
        <NavItem
          href="/dashboard/settings"
          label="Ajustes"
          icon={SettingsIcon}
        />
      </nav>

      {/* ── User footer ── */}
      <div className="p-3">
        <div className="flex items-center gap-3 rounded-xl bg-inverse-on-surface/8 px-3 py-2.5">
          <UserAvatar name={displayName} avatarUrl={avatarUrl} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-body text-sm font-semibold text-inverse-on-surface">
              {displayName}
            </p>
            <p className="truncate font-body text-xs text-on-surface-variant/60">
              {email}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg p-2.5 text-on-surface-variant/60 transition-colors hover:bg-error-container/60 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
