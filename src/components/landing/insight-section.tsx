import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

export function InsightSection() {
  return (
    <section className="px-6 py-24 bg-surface-container-low">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="mb-12 text-center">
          <p className="text-on-surface-variant font-label text-xs font-semibold uppercase tracking-widest mb-3">
            Análisis en tiempo real
          </p>
          <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-on-surface leading-tight">
            Ve exactamente qué está fallando
            <br />
            en tu video.
          </h2>
        </div>

        {/* Product demo card — looks like real RAG output */}
        <div className="bg-surface-bright border border-outline-variant/50 rounded-2xl overflow-hidden shadow-sm">
          {/* Video metadata bar */}
          <div className="border-b border-outline-variant/40 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-headline font-extrabold text-xs">
                  YT
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-body font-semibold text-on-surface truncate">
                  &ldquo;Cómo crecí de 0 a 50K subs en 6 meses | Estrategia
                  Real&rdquo;
                </p>
                <p className="text-xs text-on-surface-variant font-label">
                  TechCreator_ES&nbsp;·&nbsp;18:32&nbsp;·&nbsp;24,890 views
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-container text-xs font-label font-semibold self-start sm:self-center shrink-0">
              Análisis completo
            </span>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-outline-variant/40">
            <div className="p-5 border-r border-outline-variant/40">
              <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2">
                Hook Score
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-headline font-extrabold text-primary tabular-nums">
                  4.2
                </span>
                <span className="text-sm text-on-surface-variant">/10</span>
                <TrendingDown className="text-error ml-0.5" size={15} />
              </div>
            </div>

            <div className="p-5 md:border-r border-outline-variant/40">
              <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2">
                Abandono :08s
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-headline font-extrabold text-error tabular-nums">
                  68%
                </span>
                <AlertCircle className="text-error ml-0.5" size={15} />
              </div>
            </div>

            <div className="p-5 border-r border-outline-variant/40 border-t md:border-t-0">
              <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2">
                CTR Estimado
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-headline font-extrabold text-on-surface tabular-nums">
                  3.8%
                </span>
              </div>
            </div>

            <div className="p-5 border-t md:border-t-0">
              <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2">
                RPM Potencial
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-headline font-extrabold text-secondary tabular-nums">
                  +18%
                </span>
                <TrendingUp className="text-secondary ml-0.5" size={15} />
              </div>
            </div>
          </div>

          {/* AI Diagnosis */}
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-on-primary text-xs font-headline font-bold">
                  IA
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                  Diagnóstico — Hook
                </p>
                <p className="text-base font-body text-on-surface leading-relaxed mb-5">
                  Tu introducción revela el resultado antes de crear
                  expectativa. Los primeros 8 segundos muestran &ldquo;crecí a
                  50K&rdquo; — el espectador ya sabe el final y se va. Reformula
                  el hook como una pregunta que{' '}
                  <strong>solo este video puede responder</strong>.
                </p>

                {/* Projected impact box */}
                <div className="bg-secondary-container/50 border border-secondary/25 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="text-secondary shrink-0 mt-0.5"
                      size={16}
                    />
                    <div>
                      <p className="text-sm font-body font-semibold text-on-surface mb-1">
                        Impacto proyectado si se implementa
                      </p>
                      <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                        Retención primeros 30s:{' '}
                        <strong className="text-on-surface">+23%</strong>
                        &nbsp;·&nbsp;RPM estimado:{' '}
                        <strong className="text-on-surface">+18%</strong>
                        &nbsp;·&nbsp;Basado en análisis de 3,200 videos en nicho
                        tecnológico
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer — next action */}
          <div className="border-t border-outline-variant/40 px-6 py-4 bg-surface-container-low/50 flex items-center justify-between">
            <p className="text-sm font-body text-on-surface-variant">
              2 recomendaciones más disponibles para este video
            </p>
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm font-headline font-bold text-primary hover:text-primary-dim transition-colors"
            >
              Ver análisis completo
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
