import { cn } from '@/lib/utils'

interface OnboardStep {
  number: string
  title: string
  description: string
}

const STEPS: OnboardStep[] = [
  {
    number: '01',
    title: 'Pega una URL de YouTube',
    description: 'Cualquier video con subtítulos en español o inglés.',
  },
  {
    number: '02',
    title: 'Lo convertimos en vectores',
    description: 'Transcript → chunks → embeddings → memoria semántica.',
  },
  {
    number: '03',
    title: 'Pregunta en lenguaje natural',
    description: 'Busca ideas, hooks y momentos clave entre tus videos.',
  },
]

export function OnboardingSteps() {
  return (
    <section aria-label="Cómo funciona">
      <h2 className="mb-3 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        Cómo funciona
      </h2>
      <ol className="flex flex-col gap-2">
        {STEPS.map((step, index) => (
          <li
            key={step.number}
            className="flex items-start gap-4 rounded-lg border border-outline-variant bg-background px-4 py-4"
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex-shrink-0 font-headline text-xl font-black leading-none',
                index === 0 ? 'text-primary' : 'text-outline-variant',
              )}
            >
              {step.number}
            </span>
            <div>
              <h3
                className={cn(
                  'font-headline text-sm font-bold',
                  index === 0 ? 'text-on-surface' : 'text-on-surface-variant',
                )}
              >
                {step.title}
              </h3>
              <p className="mt-0.5 font-body text-xs leading-relaxed text-on-surface-variant">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
