interface SectionItem {
  id: string
  content: string | null
}

interface VideoSectionsListProps {
  sections: SectionItem[]
}

export function VideoSectionsList({ sections }: VideoSectionsListProps) {
  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-outline-variant px-6 py-12 text-center">
        <p className="font-body text-sm text-on-surface-variant">
          Este video no tiene fragmentos indexados.
        </p>
      </div>
    )
  }

  return (
    <section aria-labelledby="sections-heading" className="flex flex-col gap-4">
      <h2
        id="sections-heading"
        className="font-body text-xs font-semibold uppercase tracking-wide text-on-surface-variant"
      >
        Fragmentos del transcript ({sections.length})
      </h2>

      <ol className="flex flex-col gap-3">
        {sections.map((section, index) => (
          <SectionItem key={section.id} section={section} index={index} />
        ))}
      </ol>
    </section>
  )
}

interface SectionItemProps {
  section: SectionItem
  index: number
}

function SectionItem({ section, index }: SectionItemProps) {
  return (
    <li className="flex gap-4 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-container font-body text-xs font-bold text-on-primary-container"
      >
        {index + 1}
      </span>
      <p className="font-body text-sm leading-relaxed text-on-surface">
        {section.content ?? '—'}
      </p>
    </li>
  )
}
