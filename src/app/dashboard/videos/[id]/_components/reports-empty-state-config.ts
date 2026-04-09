export const GENERATION_TARGET = {
  INTELLIGENCE: 'intelligence',
  SEO: 'seo',
  ALL: 'all',
} as const

export type GenerationTarget =
  (typeof GENERATION_TARGET)[keyof typeof GENERATION_TARGET]

export type ReportKind = Exclude<GenerationTarget, 'all'>

export interface CardConfig {
  kind: ReportKind
  title: string
  description: string
  readyLabel: string
  missingLabel: string
  actionLabel: string
}

export const REPORT_CARDS: Record<ReportKind, CardConfig> = {
  [GENERATION_TARGET.INTELLIGENCE]: {
    kind: GENERATION_TARGET.INTELLIGENCE,
    title: 'Informe de Inteligencia',
    description:
      'Resumen, reutilización de contenido y análisis profundo del video.',
    readyLabel: 'Disponible',
    missingLabel: 'No generado',
    actionLabel: 'Generar informe',
  },
  [GENERATION_TARGET.SEO]: {
    kind: GENERATION_TARGET.SEO,
    title: 'SEO Pack',
    description:
      'Títulos, descripción, etiquetas, show notes y brief de miniatura.',
    readyLabel: 'Disponible',
    missingLabel: 'No generado',
    actionLabel: 'Generar SEO Pack',
  },
}
