import { Link2 } from 'lucide-react'
import Link from 'next/link'

interface HeroSectionProps {
  isAuthenticated: boolean
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  const analyzeHref = isAuthenticated
    ? '/dashboard/videos/new'
    : '/login?redirectTo=/dashboard'

  return (
    <section className="px-6 py-20 md:py-32">
      <div className="max-w-5xl mx-auto text-center">
        {/* Social proof badge — replaces generic "RAG AI Technology" */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container mb-8 border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
          <span className="text-xs font-label font-semibold text-on-primary-container tracking-wider uppercase">
            847 creadores en acceso anticipado
          </span>
        </div>

        {/* Heading — solid color, no gradient */}
        <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight mb-6 leading-[1.05]">
          Maximiza tus Ingresos en <br />
          <span className="text-primary">YouTube con IA</span>
        </h1>

        {/* Subheading — specific, action-oriented */}
        <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-12 font-body leading-relaxed">
          Pega la URL de cualquier video. Nuestra tecnología RAG analiza el
          hook, la retención y la monetización para darte estrategias
          accionables en segundos.
        </p>

        {/* URL input — with format hint for error prevention */}
        <div className="max-w-2xl mx-auto bg-surface-container-low p-2 rounded-xl border border-outline-variant/40 flex flex-col md:flex-row gap-2 shadow-sm">
          <div className="flex-1 flex items-center px-4 gap-3 bg-surface-bright rounded-lg border border-transparent focus-within:border-primary/40 transition-all">
            <Link2 className="text-on-surface-variant shrink-0" size={20} />
            <input
              className="w-full bg-transparent border-none outline-none text-on-surface placeholder:text-on-surface-variant/50 py-4 font-body text-sm"
              placeholder="https://youtube.com/watch?v=..."
              type="url"
              readOnly={!isAuthenticated}
              aria-label="URL del video de YouTube"
            />
          </div>
          <Link
            href={analyzeHref}
            className="bg-primary text-on-primary px-8 py-4 rounded-lg font-headline font-bold hover:bg-primary-dim transition-colors text-sm text-center"
          >
            Analizar Ahora
          </Link>
        </div>

        {/* Reassurance copy — directly below CTA */}
        <p className="mt-4 text-sm text-on-surface-variant font-label">
          {isAuthenticated
            ? 'Añade un video para empezar'
            : 'Sin tarjeta de crédito\u00a0·\u00a0Resultados en 30 segundos'}
        </p>
      </div>
    </section>
  )
}
