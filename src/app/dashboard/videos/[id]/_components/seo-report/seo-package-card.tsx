import { CopyButton } from '@/app/dashboard/videos/_components/intelligence-report/copy-button'
import type { SeoPackage } from '@/lib/seo/types'

interface SeoPackageCardProps {
  seoPackage: SeoPackage
}

const VARIANT_LABELS: Record<'A' | 'B' | 'C', string> = {
  A: 'Variante A',
  B: 'Variante B',
  C: 'Variante C',
}

export function SeoPackageCard({ seoPackage }: SeoPackageCardProps) {
  const allTags = seoPackage.tags.join(', ')

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 flex flex-col gap-6">
      {/* ── Card Header ── */}
      <h3 className="font-headline text-lg font-bold text-on-surface">
        Paquete SEO
      </h3>

      {/* ── Title Variants ── */}
      <section aria-label="Variantes de título" className="flex flex-col gap-4">
        <h4 className="font-headline text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
          Variantes de Título
        </h4>
        <div className="flex flex-col gap-3">
          {seoPackage.titleVariants.map((v) => (
            <TitleVariantRow
              key={v.variant}
              variant={v.variant}
              title={v.title}
              rationale={v.rationale}
              label={VARIANT_LABELS[v.variant]}
            />
          ))}
        </div>
      </section>

      {/* ── Description ── */}
      <section
        aria-label="Descripción de YouTube"
        className="flex flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-4">
          <h4 className="font-headline text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
            Descripción
          </h4>
          <CopyButton
            text={seoPackage.description}
            aria-label="Copiar descripción"
          />
        </div>
        <p className="whitespace-pre-wrap font-body text-sm text-on-surface leading-relaxed">
          {seoPackage.description}
        </p>
      </section>

      {/* ── Tags ── */}
      <section aria-label="Etiquetas" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h4 className="font-headline text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
            Etiquetas ({seoPackage.tags.length})
          </h4>
          <CopyButton text={allTags} aria-label="Copiar todas las etiquetas" />
        </div>
        <ul className="flex flex-wrap gap-2" aria-label="Lista de etiquetas">
          {seoPackage.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-secondary-container px-3 py-1 font-body text-xs font-medium text-on-secondary-container"
            >
              {tag}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

// ── Sub-component ────────────────────────────────────────────────────────────

interface TitleVariantRowProps {
  variant: 'A' | 'B' | 'C'
  title: string
  rationale: string
  label: string
}

function TitleVariantRow({
  variant,
  title,
  rationale,
  label,
}: TitleVariantRowProps) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            title={label}
            className="shrink-0 rounded-md bg-primary px-2 py-0.5 font-headline text-xs font-bold text-on-primary"
          >
            {variant}
          </span>
          <p className="font-body text-sm font-semibold text-on-surface leading-snug">
            {title}
          </p>
        </div>
        <CopyButton text={title} aria-label={`Copiar variante ${variant}`} />
      </div>
      <p className="font-body text-xs text-on-surface-variant leading-relaxed pl-8">
        {rationale}
      </p>
    </div>
  )
}
