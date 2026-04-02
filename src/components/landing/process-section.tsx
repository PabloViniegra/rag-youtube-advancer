const STEPS = [
  {
    number: '01',
    title: 'Pega el Link',
    description:
      'Solo necesitas la URL del video. Extraemos el transcript, los metadatos y las señales de audiencia automáticamente.',
    outcome: 'Listo en menos de 5 segundos',
  },
  {
    number: '02',
    title: 'La IA Analiza',
    description:
      'Nuestro motor RAG examina el hook, los puntos de abandono, las oportunidades de CTR y las tendencias de tu nicho específico.',
    outcome: 'Análisis completo en ~30 segundos',
  },
  {
    number: '03',
    title: 'Actúa con Datos',
    description:
      'Recibe un diagnóstico preciso: qué está fallando, por qué, y cuánto podría mejorar tu retención y RPM si lo corriges.',
    outcome: '+23% CTR promedio en 30 días',
  },
]

export function ProcessSection() {
  return (
    <section className="bg-inverse-surface px-6 py-24" id="features">
      <div className="max-w-7xl mx-auto">
        {/* Header — left-aligned, editorial */}
        <div className="mb-16 max-w-xl">
          <p className="text-inverse-on-surface/50 font-label text-xs font-semibold uppercase tracking-widest mb-4">
            Cómo funciona
          </p>
          <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-inverse-on-surface leading-[1.05]">
            De URL a estrategia
            <br />
            en tres pasos.
          </h2>
        </div>

        {/* Steps — numbered, left-aligned, no centered-card template */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col gap-5">
              {/* Large number as the visual anchor */}
              <span className="text-6xl md:text-7xl font-headline font-extrabold text-inverse-primary leading-none tabular-nums">
                {step.number}
              </span>

              <div>
                <h3 className="text-xl font-headline font-bold text-inverse-on-surface mb-3">
                  {step.title}
                </h3>
                <p className="text-inverse-on-surface/65 font-body text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Outcome metric badge */}
              <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full border border-inverse-primary/30 bg-inverse-primary/10">
                <span className="w-1.5 h-1.5 rounded-full bg-inverse-primary shrink-0" />
                <span className="text-inverse-primary text-xs font-label font-semibold">
                  {step.outcome}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
