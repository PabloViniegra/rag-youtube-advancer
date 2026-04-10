import type { Metadata } from 'next'
import { ViewTransition } from 'react'
import { NewVideoOrchestrator } from './_components/new-video-orchestrator'
import { PipelineHint } from './_components/pipeline-hint'

export const metadata: Metadata = {
  title: 'Añadir video',
  robots: { index: false, follow: false },
}

/**
 * /dashboard/videos/new
 *
 * Server Component shell:
 *  - Static hero section (SSR'd instantly)
 *  - NewVideoOrchestrator (client) handles form state + ingest action
 */

export default function NuevoVideoPage() {
  return (
    <ViewTransition
      enter={{
        'nav-forward': 'slide-from-right',
        'nav-back': 'slide-from-left',
        default: 'none',
      }}
      exit={{
        'nav-forward': 'slide-to-left',
        'nav-back': 'slide-to-right',
        default: 'none',
      }}
      default="none"
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
        {/* ── Hero (static, SSR'd) ── */}
        <header className="flex flex-col gap-4 animate-fade-up">
          <p className="font-headline text-xs font-bold uppercase tracking-widest text-primary">
            Segunda Mente
          </p>
          <h1 className="font-headline text-3xl font-extrabold leading-tight text-on-surface">
            Añadir video
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            Pega la URL de un video de YouTube para indexarlo. Lo analizamos en
            seis pasos automáticos:
          </p>
          <PipelineHint />
        </header>

        {/* ── Ingestion form (client) ── */}
        <NewVideoOrchestrator />
      </div>
    </ViewTransition>
  )
}
