import { Check, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface CtaSectionProps {
  isAuthenticated: boolean
}

export function CtaSection({ isAuthenticated }: CtaSectionProps) {
  const primaryHref = isAuthenticated
    ? '/dashboard'
    : '/login?redirectTo=/dashboard'
  const primaryLabel = isAuthenticated ? 'Ir al Dashboard' : 'Empieza Gratis'

  return (
    <section className="px-4 sm:px-6 py-20 md:py-32 bg-primary" id="pricing">
      <div className="max-w-4xl mx-auto text-center">
        {/* Trust metric */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-on-primary/10 mb-6 sm:mb-8 border border-on-primary/20 reveal-on-scroll">
          <TrendingUp className="text-on-primary shrink-0" size={14} />
          <span className="text-xs font-label font-semibold text-on-primary tracking-wider">
            +23% CTR promedio en los primeros 30 días
          </span>
        </div>

        {/* Headline — specific, not generic */}
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-headline font-black mb-3 sm:mb-4 leading-tight text-on-primary reveal-on-scroll">
          Para creadores
          <br className="hidden sm:block" />
          que van en serio.
        </h2>

        {/* Price anchor — visible, specific, removes anxiety */}
        <p className="text-xl sm:text-2xl font-headline font-bold text-on-primary/90 mb-6 sm:mb-8">
          $5.99/mes.{' '}
          <span className="font-body font-normal text-base sm:text-xl text-on-primary/70">
            Sin sorpresas. Cancela cuando quieras.
          </span>
        </p>

        {/* Feature list */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 text-on-primary/80">
          {[
            'Análisis ilimitado de videos',
            'Hook Generator + SEO Optimizer',
            'Insights de monetización personalizados',
          ].map((feature) => (
            <span
              key={feature}
              className="flex items-center justify-center gap-2 text-sm font-body"
            >
              <Check size={14} className="text-on-primary shrink-0" />
              {feature}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href={primaryHref}
            className="bg-on-primary text-primary px-10 py-5 rounded-xl font-headline font-extrabold text-lg hover:bg-on-primary/90 transition-all hover:scale-[1.02] active:scale-100 text-center"
          >
            {primaryLabel}
          </Link>
          <Link
            href="/login"
            className="bg-transparent text-on-primary px-10 py-5 rounded-xl font-headline font-extrabold text-lg border-2 border-on-primary/40 hover:border-on-primary/70 transition-colors text-center"
          >
            Ver Demo
          </Link>
        </div>

        <p className="mt-6 text-on-primary/55 font-label text-sm">
          1 video gratis{' '}
          <span className="text-on-primary/40">·&nbsp;·&nbsp;</span>
          Sin límite con Pro
        </p>
      </div>
    </section>
  )
}
