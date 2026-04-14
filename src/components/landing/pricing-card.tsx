import { Check, Crown, Zap } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  type PlanVariant,
  type PricingPlan,
  VARIANT_STYLES,
} from './pricing-data'

// ─── Plan Icon ───────────────────────────────────────────────────────────────
function PlanIcon({ variant }: { variant: PlanVariant }) {
  if (variant === 'max')
    return <Crown size={16} className="text-secondary" aria-hidden="true" />
  if (variant === 'pro')
    return <Zap size={16} className="text-on-primary" aria-hidden="true" />
  return null
}

// ─── Pricing Card ────────────────────────────────────────────────────────────
interface PricingCardProps {
  plan: PricingPlan
}

export function PricingCard({ plan }: PricingCardProps) {
  const s = VARIANT_STYLES[plan.variant]
  const isPro = plan.variant === 'pro'
  const isMax = plan.variant === 'max'
  const isPaid = isPro || isMax

  return (
    <article
      className={cn(
        'relative flex flex-col h-full rounded-2xl sm:rounded-3xl border reveal-on-scroll',
        isPro ? 'p-8 sm:p-10' : 'p-7 sm:p-8',
        s.card,
      )}
      aria-label={`Plan ${plan.name}`}
    >
      {/* Top badge — "Más popular" / "Para serios" */}
      {plan.badge && (isPro || isMax) && (
        <span
          className={cn(
            'absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-wider whitespace-nowrap',
            s.badgePill,
          )}
        >
          {plan.badge}
        </span>
      )}

      {/* Plan header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={cn(
            'font-label text-xs font-semibold uppercase tracking-widest',
            s.name,
          )}
        >
          {plan.name}
        </span>
        <PlanIcon variant={plan.variant} />
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-0.5 mb-3">
        <span
          className={cn(
            'font-headline font-black',
            isPro ? 'text-5xl md:text-6xl' : 'text-4xl',
            s.price,
          )}
        >
          {plan.price}
        </span>
        {plan.period && (
          <span className={cn('font-body text-base font-normal', s.period)}>
            {plan.period}
          </span>
        )}
      </div>

      {/* Video count badge */}
      <span
        className={cn(
          'inline-flex items-center self-start px-3 py-1 rounded-full border text-xs font-label font-semibold',
          s.videoBadge,
        )}
      >
        {plan.videos}
      </span>

      <p className={cn('mt-4 font-body text-sm leading-relaxed', s.desc)}>
        {plan.description}
      </p>

      <div className={cn('border-t my-6', s.divider)} aria-hidden="true" />

      {/* Feature list */}
      <ul className="flex flex-col gap-3 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check
              size={15}
              className={cn('shrink-0 mt-0.5', s.check)}
              aria-hidden="true"
            />
            <span className={cn('font-body text-sm', s.feature)}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={plan.href}
        className={cn(
          'mt-auto block w-full text-center px-6 py-3.5 rounded-xl font-headline font-extrabold text-sm transition-all hover:scale-[1.02] active:scale-100',
          s.cta,
        )}
      >
        {plan.cta}
      </Link>

      {/* Trust signal — shown only on paid plans (/harden) */}
      {isPaid && s.trustColor && (
        <p
          className={cn(
            'mt-2.5 text-center text-[11px] font-label',
            s.trustColor,
          )}
        >
          Sin compromiso · Stripe seguro
        </p>
      )}
    </article>
  )
}
