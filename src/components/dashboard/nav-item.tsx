import Link from 'next/link'
import type { ReactNode } from 'react'

interface NavItemProps {
  href: string
  label: string
  icon: () => ReactNode
}

export function NavItem({ href, label, icon: Icon }: NavItemProps) {
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
