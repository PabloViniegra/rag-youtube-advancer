'use client'

import { useState } from 'react'
import type {
  IntelligenceRepurpose,
  TweetEntry,
} from '@/lib/intelligence/types'
import { CopyButton } from './copy-button'
import { ExpandableText } from './expandable-text'
import { LinkedInIcon, MailIcon, VideoIcon, XIcon } from './icons'

// ── Props ───────────────────────────────────────────────────────────────────

interface RepurposeSectionProps {
  repurpose: IntelligenceRepurpose
}

// ── Main Section ────────────────────────────────────────────────────────────

export function RepurposeSection({ repurpose }: RepurposeSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <TwitterThreadCard thread={repurpose.twitterThread} />
      <ShortScriptCard script={repurpose.shortScript} />
      <LinkedInCard post={repurpose.linkedinPost} />
      <NewsletterCard newsletter={repurpose.newsletterDraft} />
    </div>
  )
}

// ── Twitter Thread ──────────────────────────────────────────────────────────

interface TwitterThreadCardProps {
  thread: IntelligenceRepurpose['twitterThread']
}

function TwitterThreadCard({ thread }: TwitterThreadCardProps) {
  const [expanded, setExpanded] = useState(false)
  const visibleTweets = expanded ? thread : thread.slice(0, 2)
  const fullText = thread
    .map((t) => `${t.position}/7 ${t.content}`)
    .join('\n\n')

  return (
    <ContentCard icon={<XIcon />} title="Hilo de Twitter" copyText={fullText}>
      <ol className="flex flex-col gap-2.5">
        {visibleTweets.map((tweet: TweetEntry) => (
          <li
            key={tweet.position}
            className="flex gap-2 rounded-lg bg-surface-container-low px-3 py-2"
          >
            <span className="mt-0.5 shrink-0 font-mono text-xs font-bold text-primary">
              {tweet.position}/7
            </span>
            <p className="font-body text-sm leading-relaxed text-on-surface">
              {tweet.content}
            </p>
          </li>
        ))}
      </ol>

      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2 font-body text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Ver hilo completo →
        </button>
      )}
    </ContentCard>
  )
}

// ── Short Script ────────────────────────────────────────────────────────────

interface ShortScriptCardProps {
  script: IntelligenceRepurpose['shortScript']
}

const SCRIPT_PARTS = [
  { key: 'hook', label: 'Hook' },
  { key: 'body', label: 'Cuerpo' },
  { key: 'cta', label: 'CTA' },
  { key: 'suggestedClip', label: 'Clip Sugerido' },
] as const

function ShortScriptCard({ script }: ShortScriptCardProps) {
  const fullText = `Hook: ${script.hook}\n\n${script.body}\n\nCTA: ${script.cta}\n\nClip: ${script.suggestedClip}`

  return (
    <ContentCard
      icon={<VideoIcon />}
      title="Guión para Short"
      copyText={fullText}
    >
      <div className="flex flex-col gap-3">
        {SCRIPT_PARTS.map(({ key, label }) => (
          <div key={key}>
            <span className="mb-1 block font-body text-xs font-bold uppercase tracking-wider text-secondary">
              {label}
            </span>
            <p className="font-body text-sm leading-relaxed text-on-surface">
              {script[key]}
            </p>
          </div>
        ))}
      </div>
    </ContentCard>
  )
}

// ── LinkedIn ────────────────────────────────────────────────────────────────

interface LinkedInCardProps {
  post: string
}

function LinkedInCard({ post }: LinkedInCardProps) {
  return (
    <ContentCard
      icon={<LinkedInIcon />}
      title="Post de LinkedIn"
      copyText={post}
    >
      <ExpandableText text={post} collapsedClassName="line-clamp-6" />
    </ContentCard>
  )
}

// ── Newsletter ──────────────────────────────────────────────────────────────

interface NewsletterCardProps {
  newsletter: IntelligenceRepurpose['newsletterDraft']
}

function NewsletterCard({ newsletter }: NewsletterCardProps) {
  const fullText = `Asunto: ${newsletter.subject}\n\n${newsletter.body}`

  return (
    <ContentCard
      icon={<MailIcon />}
      title="Borrador Newsletter"
      copyText={fullText}
    >
      <div className="flex flex-col gap-2">
        <div className="rounded-md bg-surface-container-low px-3 py-2">
          <span className="font-body text-xs font-bold uppercase tracking-wider text-tertiary">
            Asunto
          </span>
          <p className="font-body text-sm font-semibold text-on-surface">
            {newsletter.subject}
          </p>
        </div>
        <ExpandableText
          text={newsletter.body}
          collapsedClassName="line-clamp-4"
        />
      </div>
    </ContentCard>
  )
}

// ── Shared Card Shell ───────────────────────────────────────────────────────

interface ContentCardProps {
  icon: React.ReactNode
  title: string
  copyText: string
  children: React.ReactNode
}

function ContentCard({ icon, title, copyText, children }: ContentCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-background p-5 animate-fade-up">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            {icon}
          </span>
          <h4 className="font-headline text-sm font-bold text-on-surface">
            {title}
          </h4>
        </div>
        <CopyButton text={copyText} aria-label={`Copiar ${title}`} />
      </div>
      {children}
    </article>
  )
}
