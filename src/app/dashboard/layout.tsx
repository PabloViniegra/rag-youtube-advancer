import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { getCurrentUser, signOut } from '@/lib/auth/actions'

export const metadata: Metadata = {
  title: 'Dashboard — YouTube Intelligence',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirectTo=/dashboard')
  }

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'Usuario'

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <div className="flex min-h-svh bg-surface-container-low">
      {/* ── SIDEBAR ── */}
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
          <NavItem
            href="/dashboard/videos"
            label="Mis videos"
            icon={VideoIcon}
          />
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
                {user.email}
              </p>
            </div>
            {/* Sign out */}
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

      {/* ── MAIN CONTENT ── */}
      <div className="flex min-w-0 flex-1 flex-col">
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
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Cerrar sesión"
            >
              <LogOutIcon />
            </button>
          </form>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

interface NavItemProps {
  href: string
  label: string
  icon: () => ReactNode
}

function NavItem({ href, label, icon: Icon }: NavItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <Icon />
      {label}
    </Link>
  )
}

interface UserAvatarProps {
  name: string
  avatarUrl?: string
}

function UserAvatar({ name, avatarUrl }: UserAvatarProps) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className="size-8 shrink-0 rounded-full object-cover ring-1 ring-outline-variant"
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-container font-headline text-sm font-bold text-on-primary-container">
      {name[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

// ── Icon components ─────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 22V12h6v10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function VideoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m22.54 6.42-2.1-2.1A2 2 0 0 0 19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 1.44-.58l2.1-2.1A2 2 0 0 0 23 16V8a2 2 0 0 0-.46-1.58Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m10 9 5 3-5 3V9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path
        d="m21 21-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LogOutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
