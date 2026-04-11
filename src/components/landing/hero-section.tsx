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
    <section className="px-4 py-16 md:py-20 lg:py-24">
      <div className="max-w-5xl mx-auto text-center">
        {/* Social proof badge — live pulse dot signals real-time data */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container mb-8 border border-primary/20 animate-fade-in"
          style={{ animationDelay: '0ms' }}
        >
          <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-live-pulse" />
          <span className="text-xs font-label font-semibold text-on-primary-container tracking-wider uppercase">
            847 creadores en acceso anticipado
          </span>
        </div>

        {/* Heading — line-by-line clip-path reveal */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-headline font-extrabold tracking-tight mb-4 sm:mb-6 leading-[1.05]">
          {/* Line 1 — masked container clips text until it slides up */}
          <span className="block overflow-hidden pb-1">
            <span
              className="block animate-clip-up"
              style={{ animationDelay: '120ms' }}
            >
              Maximiza tus Ingresos en
            </span>
          </span>
          {/* Line 2 — 280ms offset for cinematic stagger */}
          <span className="block overflow-hidden pb-1">
            <span
              className="block animate-clip-up text-primary"
              style={{ animationDelay: '280ms' }}
            >
              YouTube con IA
            </span>
          </span>
        </h1>

        {/* Subheading */}
        <p
          className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-xl md:max-w-2xl mx-auto mb-8 md:mb-12 font-body leading-relaxed animate-fade-up"
          style={{ animationDelay: '460ms' }}
        >
          Pega la URL de cualquier video. Nuestra tecnología RAG analiza el
          hook, la retención y la monetización para darte estrategias
          accionables en segundos.
        </p>

        {/* URL input */}
        <div
          className="max-w-xl md:max-w-2xl mx-auto bg-surface-container-low p-3 sm:p-4 rounded-xl border border-outline-variant/40 flex flex-col sm:flex-row gap-2 sm:gap-3 shadow-sm animate-fade-up"
          style={{ animationDelay: '600ms' }}
        >
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

        {/* Reassurance copy */}
        <p
          className="mt-4 text-sm text-on-surface-variant font-label animate-fade-in"
          style={{ animationDelay: '760ms' }}
        >
          {isAuthenticated
            ? 'Añade un video para empezar'
            : '1 video gratis\u00a0·\u00a0Resultados en 30 segundos'}
        </p>
      </div>
    </section>
  )
}
