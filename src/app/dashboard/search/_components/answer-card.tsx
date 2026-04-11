'use client'

/**
 * AnswerCard — /bolder + /delight + SSE streaming
 *
 * /bolder:    Answer anchored by a crimson left border and text-xl typography.
 * /delight:   Copy button with a 2-second "Copiado ✓" feedback state.
 * streaming:  Blinking cursor while `isStreaming` is true.
 *             FeedbackRow + RelatedQueries shown only after streaming ends.
 */

import { useState, ViewTransition } from 'react'
import type { VideoSectionMatch } from '@/lib/retrieval/types'
import {
  CheckIcon,
  ClipboardIcon,
  RegenerateIcon,
  ThumbDownIcon,
  ThumbUpIcon,
} from './answer-card-icons'
import { RelatedQueries } from './related-queries'
import { SourceCard } from './source-card'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AnswerData {
  answer: string
  sources: VideoSectionMatch[]
  sourceCount: number
}

interface AnswerCardProps {
  data: AnswerData
  isStreaming?: boolean
  relatedQueries?: string[]
  onRegenerate?: () => void
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
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
    >
      {copied ? <CheckIcon /> : <ClipboardIcon />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

// ── FeedbackRow ───────────────────────────────────────────────────────────────

interface FeedbackRowProps {
  answerText: string
  onRegenerate?: () => void
}

function FeedbackRow({ answerText, onRegenerate }: FeedbackRowProps) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null)

  return (
    <div className="flex items-center gap-2 pt-1">
      <button
        type="button"
        aria-label="Respuesta útil"
        aria-pressed={vote === 'up'}
        onClick={() => setVote((v) => (v === 'up' ? null : 'up'))}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface aria-pressed:text-primary"
      >
        <ThumbUpIcon />
      </button>
      <button
        type="button"
        aria-label="Respuesta no útil"
        aria-pressed={vote === 'down'}
        onClick={() => setVote((v) => (v === 'down' ? null : 'down'))}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface aria-pressed:text-primary"
      >
        <ThumbDownIcon />
      </button>

      <div className="ml-auto flex items-center gap-2">
        <CopyButton text={answerText} />
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <RegenerateIcon />
            Regenerar
          </button>
        )}
      </div>
    </div>
  )
}

// ── AnswerCard ────────────────────────────────────────────────────────────────

export function AnswerCard({
  data,
  isStreaming = false,
  relatedQueries,
  onRegenerate,
}: AnswerCardProps) {
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
            {/* Copy button in header only while streaming (no FeedbackRow yet) */}
            {isStreaming && <CopyButton text={data.answer} />}
          </div>

          <p className="whitespace-pre-wrap break-words font-body text-xl leading-relaxed text-on-surface">
            {data.answer}
            {isStreaming && (
              <span
                aria-hidden
                className="ml-px inline-block h-[1em] w-0.5 translate-y-0.5 bg-primary align-middle [animation:blink_0.8s_steps(1)_infinite] motion-reduce:hidden"
              />
            )}
          </p>

          {/* Feedback row — only after streaming completes */}
          {!isStreaming && (
            <div className="mt-4">
              <FeedbackRow
                answerText={data.answer}
                onRegenerate={onRegenerate}
              />
            </div>
          )}
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

        {/* Related queries — only after streaming completes */}
        {!isStreaming && relatedQueries && relatedQueries.length > 0 && (
          <RelatedQueries queries={relatedQueries} />
        )}
      </section>
    </ViewTransition>
  )
}
