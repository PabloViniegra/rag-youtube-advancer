import { CopyButton } from '@/app/dashboard/videos/_components/intelligence-report/copy-button'
import type { ShowNotes } from '@/lib/seo/types'

interface ShowNotesCardProps {
  showNotes: ShowNotes
}

export function ShowNotesCard({ showNotes }: ShowNotesCardProps) {
  const resourcesText = showNotes.resources.join('\n')
  const suggestedLinksText = showNotes.suggestedLinks.join('\n')

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 flex flex-col gap-6">
      {/* ── Card Header ── */}
      <h3 className="font-headline text-lg font-bold text-on-surface">
        Show Notes
      </h3>

      {/* ── Episode Title ── */}
      <section aria-label="Título del episodio" className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <h4 className="font-headline text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
            Título del Episodio
          </h4>
          <CopyButton
            text={showNotes.episodeTitle}
            aria-label="Copiar título del episodio"
          />
        </div>
        <p className="font-body text-sm font-semibold text-on-surface leading-snug">
          {showNotes.episodeTitle}
        </p>
      </section>

      {/* ── Description ── */}
      <section
        aria-label="Descripción del episodio"
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between gap-4">
          <h4 className="font-headline text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
            Descripción
          </h4>
          <CopyButton
            text={showNotes.description}
            aria-label="Copiar descripción del episodio"
          />
        </div>
        <p className="whitespace-pre-wrap font-body text-sm text-on-surface leading-relaxed">
          {showNotes.description}
        </p>
      </section>

      {/* ── Resources ── */}
      {showNotes.resources.length > 0 && (
        <section
          aria-label="Recursos mencionados"
          className="flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-4">
            <h4 className="font-headline text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
              Recursos
            </h4>
            <CopyButton text={resourcesText} aria-label="Copiar recursos" />
          </div>
          <ul className="flex flex-col gap-1.5">
            {showNotes.resources.map((resource) => (
              <li
                key={resource}
                className="flex items-start gap-2 font-body text-sm text-on-surface"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                {resource}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Suggested Links ── */}
      {showNotes.suggestedLinks.length > 0 && (
        <section aria-label="Enlaces sugeridos" className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <h4 className="font-headline text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
              Enlaces Sugeridos
            </h4>
            <CopyButton
              text={suggestedLinksText}
              aria-label="Copiar enlaces sugeridos"
            />
          </div>
          <ul className="flex flex-col gap-1.5">
            {showNotes.suggestedLinks.map((link) => (
              <li
                key={link}
                className="flex items-start gap-2 font-body text-sm text-on-surface"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tertiary"
                  aria-hidden="true"
                />
                {link}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
