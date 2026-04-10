'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
] as const

type SectionId = (typeof NAV_ITEMS)[number]['id']

export function NavLinks() {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    for (const { id } of NAV_ITEMS) {
      const el = document.getElementById(id)
      if (!el) continue

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id)
          }
        },
        // Section is "active" when it occupies the middle band of the viewport
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
      )

      observer.observe(el)
      observers.push(observer)
    }

    return () => {
      for (const o of observers) {
        o.disconnect()
      }
    }
  }, [])

  return (
    <ul className="hidden md:flex gap-8 items-center list-none m-0 p-0">
      {NAV_ITEMS.map(({ id, label }) => {
        const isActive = activeSection === id
        return (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'font-body text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded',
                isActive
                  ? 'text-primary border-b-2 border-primary pb-0.5'
                  : 'text-on-surface-variant hover:text-on-surface',
              )}
            >
              {label}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
