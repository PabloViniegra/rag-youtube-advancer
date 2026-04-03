'use client'

/**
 * AnswerCard — /bolder + /delight
 *
 * /bolder:  Answer anchored by a crimson left border and text-xl typography.
 * /delight: Copy button with a 2-second "Copiado ✓" feedback state.
 */

import { useState, ViewTransition } from 'react'
import type { VideoSectionMatch } from '@/lib/retrieval/types'
import { SourceCard } from './source-card'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AnswerData {
  answer: string
  sources: VideoSectionMatch[]
  sourceCount: number
}

// ── CopyButton ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — fail silently
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copiado' : 'Copiar respuesta'}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {copied ? <CheckIcon /> : <ClipboardIcon />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

// ── AnswerCard ────────────────────────────────────────────────────────────────

export function AnswerCard({ data }: { data: AnswerData }) {
  return (
    <ViewTransition enter="slide-up" default="none">
      <section aria-labelledby="answer-heading" className="flex flex-col gap-6">
        {/* Answer block — editorial crimson left border */}
        <div className="border-l-4 border-primary pl-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2
              id="answer-heading"
              className="font-headline text-xs font-bold uppercase tracking-widest text-primary"
            >
              Respuesta
            </h2>
            <CopyButton text={data.answer} />
          </div>
          <p className="whitespace-pre-wrap break-words font-body text-xl leading-relaxed text-on-surface">
            {data.answer}
          </p>
        </div>

        {/* Source fragments */}
        {data.sources.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Qué encontré en tus videos ({data.sourceCount})
            </h3>
            <ol className="flex flex-col gap-2">
              {data.sources.map((source, i) => (
                <SourceCard key={source.id} source={source} index={i} />
              ))}
            </ol>
          </div>
        )}
      </section>
    </ViewTransition>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ClipboardIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="9"
        y="2"
        width="6"
        height="4"
        rx="1"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
