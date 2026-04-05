import { CopyButton } from '@/app/dashboard/videos/_components/intelligence-report/copy-button'
import type { ThumbnailBrief } from '@/lib/seo/types'

interface ThumbnailBriefCardProps {
  thumbnailBrief: ThumbnailBrief
}

function buildBriefText(brief: ThumbnailBrief): string {
  return [
    `Elemento principal: ${brief.mainElement}`,
    `Texto en pantalla: ${brief.textOverlay}`,
    `Tono emocional: ${brief.emotionalTone}`,
    `Composición: ${brief.composition}`,
    `Colores: ${brief.colorSuggestions.join(', ')}`,
  ].join('\n')
}

export function ThumbnailBriefCard({
  thumbnailBrief,
}: ThumbnailBriefCardProps) {
  const briefText = buildBriefText(thumbnailBrief)

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-6 flex flex-col gap-6">
      {/* ── Card Header ── */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-headline text-lg font-bold text-on-surface">
          Brief de Miniatura
        </h3>
        <CopyButton
          text={briefText}
          aria-label="Copiar brief completo de miniatura"
        />
      </div>

      {/* ── Fields ── */}
      <dl className="flex flex-col gap-4">
        <BriefField
          label="Elemento principal"
          value={thumbnailBrief.mainElement}
        />
        <BriefField
          label="Texto en pantalla"
          value={thumbnailBrief.textOverlay}
        />
        <BriefField
          label="Tono emocional"
          value={thumbnailBrief.emotionalTone}
        />
        <BriefField label="Composición" value={thumbnailBrief.composition} />

        {/* ── Color Suggestions ── */}
        <div className="flex flex-col gap-2">
          <dt className="font-headline text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Colores sugeridos
          </dt>
          <dd>
            <ul
              className="flex flex-wrap gap-2"
              aria-label="Sugerencias de color"
            >
              {thumbnailBrief.colorSuggestions.map((color) => (
                <li
                  key={color}
                  className="rounded-full border border-outline-variant bg-surface-container px-3 py-1 font-body text-xs font-medium text-on-surface"
                >
                  {color}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </div>
  )
}

// ── Sub-component ────────────────────────────────────────────────────────────

interface BriefFieldProps {
  label: string
  value: string
}

function BriefField({ label, value }: BriefFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-headline text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
        {label}
      </dt>
      <dd className="font-body text-sm text-on-surface leading-relaxed">
        {value}
      </dd>
    </div>
  )
}
