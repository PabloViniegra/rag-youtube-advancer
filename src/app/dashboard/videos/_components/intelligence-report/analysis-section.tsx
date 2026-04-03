import type {
  EntityMention,
  EntityType,
  IntelligenceAnalysis,
  SentimentAnalysis,
} from '@/lib/intelligence/types'
import { cn } from '@/lib/utils'
import { CopyButton } from './copy-button'
import { QuestionIcon } from './icons'

// ── Props ───────────────────────────────────────────────────────────────────

interface AnalysisSectionProps {
  analysis: IntelligenceAnalysis
}

// ── Main Section ────────────────────────────────────────────────────────────

export function AnalysisSection({ analysis }: AnalysisSectionProps) {
  return (
    <div className="flex flex-col gap-8">
      <SentimentCard sentiment={analysis.sentiment} />
      <EntitiesList entities={analysis.entities} />
      <SuggestedQuestions questions={analysis.suggestedQuestions} />
    </div>
  )
}

// ── Sentiment Card ──────────────────────────────────────────────────────────

const TONE_LABELS: Record<SentimentAnalysis['tone'], string> = {
  optimista: 'Optimista',
  critico: 'Crítico',
  educativo: 'Educativo',
  polemico: 'Polémico',
  inspiracional: 'Inspiracional',
  tecnico: 'Técnico',
  conversacional: 'Conversacional',
} as const

interface SentimentCardProps {
  sentiment: SentimentAnalysis
}

function SentimentCard({ sentiment }: SentimentCardProps) {
  const confidencePct = Math.round(sentiment.confidence * 100)

  return (
    <section aria-labelledby="sentiment-heading" className="animate-fade-up">
      <h3
        id="sentiment-heading"
        className="mb-4 font-headline text-lg font-extrabold text-on-surface"
      >
        Análisis de Sentimiento
      </h3>

      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-lg bg-primary px-3 py-1.5 font-headline text-sm font-bold text-on-primary">
            {TONE_LABELS[sentiment.tone]}
          </span>
          <span className="font-body text-xs text-on-surface-variant">
            {confidencePct}% confianza
          </span>
        </div>

        {/* Confidence bar */}
        <div
          className="mb-4 h-2 w-full overflow-hidden rounded-full bg-surface-container"
          role="progressbar"
          aria-valuenow={confidencePct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Confianza: ${confidencePct}%`}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${confidencePct}%` }}
          />
        </div>

        <p className="font-body text-sm leading-relaxed text-on-surface">
          {sentiment.explanation}
        </p>
      </div>
    </section>
  )
}

// ── Entities ────────────────────────────────────────────────────────────────

const ENTITY_TYPE_STYLES: Record<EntityType, string> = {
  persona: 'bg-primary-container text-on-primary-container',
  marca: 'bg-secondary-container text-on-secondary-container',
  herramienta: 'bg-tertiary-container text-on-tertiary-container',
  libro: 'bg-error-container text-on-error-container',
  concepto: 'bg-surface-container-high text-on-surface',
} as const

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  persona: 'Persona',
  marca: 'Marca',
  herramienta: 'Herramienta',
  libro: 'Libro',
  concepto: 'Concepto',
} as const

interface EntitiesListProps {
  entities: EntityMention[]
}

function EntitiesList({ entities }: EntitiesListProps) {
  if (entities.length === 0) return null

  return (
    <section aria-labelledby="entities-heading">
      <h3
        id="entities-heading"
        className="mb-4 font-headline text-lg font-extrabold text-on-surface"
      >
        Entidades Mencionadas
      </h3>

      <ul className="flex flex-wrap gap-2">
        {entities.map((entity) => (
          <li
            key={entity.name}
            className="animate-fade-up stagger-item group relative"
            style={{ '--i': entities.indexOf(entity) } as React.CSSProperties}
          >
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5',
                'font-body text-xs font-semibold transition-colors',
                ENTITY_TYPE_STYLES[entity.type],
              )}
              title={entity.context}
            >
              {entity.name}
              <span className="rounded-md bg-black/10 px-1.5 py-0.5 text-[10px] font-bold uppercase">
                {ENTITY_TYPE_LABELS[entity.type]}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ── Suggested Questions ─────────────────────────────────────────────────────

interface SuggestedQuestionsProps {
  questions: [string, string, string]
}

function SuggestedQuestions({ questions }: SuggestedQuestionsProps) {
  return (
    <section aria-labelledby="questions-heading">
      <h3
        id="questions-heading"
        className="mb-4 font-headline text-lg font-extrabold text-on-surface"
      >
        Preguntas Sugeridas
      </h3>

      <div className="grid gap-3 md:grid-cols-3">
        {questions.map((question, idx) => (
          <article
            key={question.slice(0, 32)}
            className="animate-fade-up stagger-item flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-low p-4"
            style={{ '--i': idx } as React.CSSProperties}
          >
            <QuestionIcon />
            <p className="flex-1 font-body text-sm leading-relaxed text-on-surface">
              {question}
            </p>
            <CopyButton
              text={question}
              aria-label={`Copiar pregunta: ${question.slice(0, 40)}`}
            />
          </article>
        ))}
      </div>
    </section>
  )
}
