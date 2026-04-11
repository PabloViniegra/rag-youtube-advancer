'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ExpandableTextProps {
  text: string
  collapsedClassName: string
}

export function ExpandableText({
  text,
  collapsedClassName,
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex flex-col">
      <p
        className={cn(
          'whitespace-pre-line font-body text-sm leading-relaxed text-on-surface',
          !expanded && collapsedClassName,
        )}
      >
        {text}
      </p>

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="mt-2 self-start font-body text-xs font-semibold text-primary hover:underline"
      >
        {expanded ? 'Ver menos' : 'Ver completo'}
      </button>
    </div>
  )
}
