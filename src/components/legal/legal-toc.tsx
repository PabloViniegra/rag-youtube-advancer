'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { TocSection } from './legal-layout'

export function LegalToc({ sections }: { sections: TocSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-72px 0px -72% 0px', threshold: 0 },
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  return (
    <nav
      aria-label="Tabla de contenidos"
      className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto"
    >
      <p className="text-[10px] font-label font-bold uppercase tracking-[0.14em] text-on-surface-variant/70 mb-3 px-2.5">
        Contenido
      </p>
      <ol className="space-y-0.5">
        {sections.map((section, i) => {
          const isActive = activeId === section.id
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={cn(
                  'flex items-start gap-2.5 text-sm py-1.5 px-2.5 rounded-lg transition-colors duration-150 cursor-pointer',
                  isActive
                    ? 'text-primary font-semibold bg-primary-container'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
                )}
              >
                <span className="text-[11px] tabular-nums mt-[3px] opacity-40 shrink-0 font-mono w-5 text-right">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="leading-snug">{section.title}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
