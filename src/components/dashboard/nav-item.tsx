'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface NavItemProps {
  href: string
  label: string
  icon: () => ReactNode
}

export function NavItem({ href, label, icon: Icon }: NavItemProps) {
  const pathname = usePathname()
  // Exact match for /dashboard, prefix match for sub-routes
  const isActive =
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href)

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex min-w-0 items-center gap-3 rounded-lg px-3 py-3 font-body text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        isActive
          ? 'bg-primary text-on-primary'
          : 'text-on-surface-variant/70 hover:bg-inverse-on-surface/8 hover:text-inverse-on-surface',
      )}
    >
      {/* Active left-bar indicator — sweeps in from center */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 origin-center rounded-full bg-on-primary transition-[transform,opacity] duration-300',
          isActive ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0',
        )}
      />
      {/* Active: accent left bar replaces icon visual weight */}
      <span
        className={cn(
          'flex size-4 shrink-0 items-center justify-center transition-transform',
          isActive ? 'scale-110' : 'group-hover:scale-105',
        )}
      >
        <Icon />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  )
}
