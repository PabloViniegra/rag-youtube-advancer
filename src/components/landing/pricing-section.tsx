import { PLANS } from './pricing-data'
import { PricingCard } from './pricing-card'

export function PricingSection() {
  return (
    <section
      className="bg-background px-4 sm:px-6 py-16 md:py-24"
      id="plans"
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="mb-12 md:mb-16 max-w-xl reveal-on-scroll">
          <p className="text-on-surface-variant font-label text-xs font-semibold uppercase tracking-widest mb-3 md:mb-4">
            Precios
          </p>
          <h2
            id="pricing-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-headline font-extrabold text-on-surface leading-[1.05]"
          >
            Elige el plan
            <br className="hidden sm:block" />
            que te impulsa.
          </h2>
        </div>

        {/* Asymmetric grid — Pro dominates center column (/overdrive + /bolder) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr_1fr] gap-5 md:gap-6 items-stretch">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        <p className="mt-10 text-center text-on-surface-variant/60 font-label text-xs">
          Sin contratos. Cancela cuando quieras.{' '}
          <span className="text-on-surface-variant/40" aria-hidden="true">·</span>{' '}
          Pagos seguros con Stripe.
        </p>
      </div>
    </section>
  )
}
