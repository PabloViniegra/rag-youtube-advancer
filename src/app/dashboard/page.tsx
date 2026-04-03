import type { Metadata } from 'next'
import Link from 'next/link'
import { ViewTransition } from 'react'
import { getCurrentUser } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Inicio — Dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const user = await getCurrentUser()

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0] ??
    'Creator'

  // Real stats from DB
  let videoCount = 0
  let sectionCount = 0

  if (user) {
    // Fetch user's videos first, then count sections for those video IDs
    const videosRes = await supabase
      .from('videos')
      .select('id')
      .eq('user_id', user.id)

    const videoRows = (videosRes.data ?? []) as Array<{ id: string }>
    videoCount = videoRows.length

    if (videoCount > 0) {
      const videoIds = videoRows.map((v) => v.id)
      const sectionsRes = await supabase
        .from('video_sections')
        .select('id', { count: 'exact', head: true })
        .in('video_id', videoIds)
      sectionCount = sectionsRes.count ?? 0
    }
  }

  const hasVideos = videoCount > 0

  return (
    <ViewTransition
      enter={{
        'nav-forward': 'slide-from-right',
        'nav-back': 'slide-from-left',
        default: 'slide-up',
      }}
      exit={{
        'nav-forward': 'slide-to-left',
        'nav-back': 'slide-to-right',
        default: 'none',
      }}
      default="none"
    >
      <div className="flex flex-col gap-10">
        {/* ── Hero greeting — asymmetric, editorial ── */}
        <div className="relative flex flex-col gap-2 border-b border-outline-variant pb-8">
          {/* Overline label */}
          <span className="font-headline text-xs font-bold uppercase tracking-widest text-primary">
            Tu segundo cerebro
          </span>

          {/* Display headline — dramatic scale */}
          <h1 className="break-words font-headline text-4xl font-extrabold leading-[1.1] text-on-surface md:text-5xl">
            Hola, <span className="text-primary">{displayName}.</span>
          </h1>

          <p className="max-w-lg font-body text-base text-on-surface-variant">
            {hasVideos
              ? `Tienes ${videoCount} video${videoCount === 1 ? '' : 's'} indexado${videoCount === 1 ? '' : 's'} y ${sectionCount} fragmentos en memoria.`
              : 'Pega la URL de un video de YouTube y conviértelo en conocimiento consultable.'}
          </p>

          {/* Primary CTA — unmissable */}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard/videos/new"
              transitionTypes={['nav-forward']}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 font-body text-sm font-bold text-on-primary shadow-sm transition-all hover:bg-primary-dim active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <PlusIcon />
              Indexar video
            </Link>
            {hasVideos && (
              <Link
                href="/dashboard/search"
                transitionTypes={['nav-forward']}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-outline-variant bg-background px-6 font-body text-sm font-semibold text-on-surface transition-all hover:border-outline hover:bg-surface-container active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <SearchIcon />
                Buscar en mi cerebro
              </Link>
            )}
          </div>
        </div>

        {/* ── Stats strip — horizontal, data as hero ── */}
        {hasVideos && (
          <div className="grid grid-cols-2 divide-x divide-y divide-outline-variant overflow-hidden rounded-xl border border-outline-variant md:grid-cols-4 md:divide-y-0">
            <StatCell value={String(videoCount)} label="Videos indexados" />
            <StatCell
              value={String(sectionCount)}
              label="Fragmentos en memoria"
            />
            <StatCell value="RAG" label="Motor de búsqueda" />
            <StatCell value="Free" label="Plan actual" accent />
          </div>
        )}

        {/* ── Empty state — onboarding ── */}
        {!hasVideos && (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <OnboardStep
              step="01"
              title="Pega una URL"
              description="Cualquier video de YouTube con subtítulos en español o inglés."
            />
            <OnboardStep
              step="02"
              title="Lo indexamos"
              description="Extraemos el transcript, lo dividimos y lo convertimos en vectores semánticos."
            />
            <OnboardStep
              step="03"
              title="Pregunta en lenguaje natural"
              description="Busca ideas, momentos clave o genera ganchos para redes sociales."
              highlight
            />
          </div>
        )}
      </div>
    </ViewTransition>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface StatCellProps {
  value: string
  label: string
  accent?: boolean
}

function StatCell({ value, label, accent }: StatCellProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 px-5 py-4',
        accent ? 'bg-secondary-container' : 'bg-background',
      )}
    >
      <p
        data-tabular-nums
        className={cn(
          'font-headline text-2xl font-extrabold',
          accent ? 'text-secondary-dim' : 'text-on-surface',
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          'font-body text-xs',
          accent ? 'text-on-secondary-container' : 'text-on-surface-variant',
        )}
      >
        {label}
      </p>
    </div>
  )
}

interface OnboardStepProps {
  step: string
  title: string
  description: string
  highlight?: boolean
}

function OnboardStep({
  step,
  title,
  description,
  highlight,
}: OnboardStepProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 rounded-xl border p-6',
        highlight
          ? 'border-primary bg-primary-container'
          : 'border-outline-variant bg-background',
      )}
    >
      {/* Step number — large, de-emphasized unless highlight */}
      <span
        className={cn(
          'select-none font-headline text-5xl font-extrabold leading-none',
          highlight ? 'text-primary' : 'text-outline-variant',
        )}
      >
        {step}
      </span>
      <div className="flex flex-col gap-1">
        <h3
          className={cn(
            'font-headline text-base font-bold',
            highlight ? 'text-on-primary-container' : 'text-on-surface',
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'font-body text-sm leading-relaxed',
            highlight
              ? 'text-on-primary-container/80'
              : 'text-on-surface-variant',
          )}
        >
          {description}
        </p>
      </div>
      {highlight && (
        <span className="mt-auto inline-flex items-center gap-1 font-body text-xs font-semibold text-primary">
          Empieza aquí
          <ArrowRightIcon />
        </span>
      )}
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
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

function ArrowRightIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
