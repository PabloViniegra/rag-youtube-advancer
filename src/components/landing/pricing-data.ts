// ─── Plan Variant ───────────────────────────────────────────────────────────
const PLAN_VARIANT = {
  FREE: 'free',
  PRO: 'pro',
  MAX: 'max',
} as const

export type PlanVariant = (typeof PLAN_VARIANT)[keyof typeof PLAN_VARIANT]

// ─── Types ───────────────────────────────────────────────────────────────────
export interface PricingPlan {
  id: string
  name: string
  price: string
  period: string
  videos: string
  description: string
  features: readonly string[]
  cta: string
  href: string
  variant: PlanVariant
  badge?: string
}

export interface VariantStyle {
  card: string
  name: string
  price: string
  period: string
  videoBadge: string
  desc: string
  divider: string
  check: string
  feature: string
  cta: string
  badgePill: string
  trustColor: string
}

// ─── Plan Data ───────────────────────────────────────────────────────────────
export const PLANS: readonly PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'Gratis',
    period: '',
    videos: '1 video',
    description: 'Prueba el sistema sin tarjeta de crédito.',
    features: [
      '1 video de prueba',
      'Búsqueda semántica básica',
      'Resumen IA del video',
    ],
    cta: 'Empezar gratis',
    href: '/login',
    variant: PLAN_VARIANT.FREE,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '€5.99',
    period: '/mes',
    videos: '25 videos',
    description: 'Para creadores que publican con consistencia.',
    features: [
      'Todo lo del plan Free',
      '25 videos al mes',
      'Reportes de rendimiento del canal',
      'SEO Optimizer',
      'Hook Generator',
      'Soporte prioritario',
    ],
    cta: 'Suscribirse al plan Pro',
    href: '/dashboard/settings',
    variant: PLAN_VARIANT.PRO,
    badge: 'Más popular',
  },
  {
    id: 'max',
    name: 'Max',
    price: '€15.99',
    period: '/mes',
    videos: '100 videos',
    description: 'Para creadores que escalan en serio.',
    features: [
      'Todo lo del plan Pro',
      '100 videos al mes',
      'Análisis de tendencias del nicho',
      'Exportación completa de datos',
      'Beta access + soporte 1:1',
    ],
    cta: 'Suscribirse al plan Max',
    href: '/dashboard/settings',
    variant: PLAN_VARIANT.MAX,
    badge: 'Para serios',
  },
]

// ─── Variant Styles ──────────────────────────────────────────────────────────
export const VARIANT_STYLES: Record<PlanVariant, VariantStyle> = {
  [PLAN_VARIANT.FREE]: {
    card: 'bg-surface-container-low border-outline-variant/40',
    name: 'text-on-surface-variant',
    price: 'text-on-surface',
    period: 'text-on-surface-variant',
    videoBadge: 'bg-surface-container-highest border-outline-variant/40 text-on-surface-variant',
    desc: 'text-on-surface-variant',
    divider: 'border-outline-variant/30',
    check: 'text-primary',
    feature: 'text-on-surface',
    cta: 'bg-surface-container-highest text-on-surface hover:bg-outline-variant/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    badgePill: '',
    trustColor: '',
  },
  [PLAN_VARIANT.PRO]: {
    card: 'bg-primary border-primary shadow-xl shadow-primary/25',
    name: 'text-on-primary',
    price: 'text-on-primary',
    period: 'text-on-primary/70',
    videoBadge: 'bg-on-primary/15 border-on-primary/25 text-on-primary',
    desc: 'text-on-primary/75',
    divider: 'border-on-primary/15',
    check: 'text-on-primary',
    feature: 'text-on-primary/85',
    cta: 'bg-on-primary text-primary hover:bg-on-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary',
    badgePill: 'bg-on-primary text-primary',
    trustColor: 'text-on-primary/45',
  },
  [PLAN_VARIANT.MAX]: {
    card: 'bg-inverse-surface border-inverse-surface',
    name: 'text-inverse-on-surface/55',
    price: 'text-inverse-on-surface',
    period: 'text-inverse-on-surface/55',
    videoBadge: 'bg-inverse-on-surface/10 border-inverse-on-surface/15 text-inverse-on-surface/75',
    desc: 'text-inverse-on-surface/65',
    divider: 'border-inverse-on-surface/15',
    check: 'text-secondary',
    feature: 'text-inverse-on-surface/80',
    cta: 'bg-inverse-on-surface text-on-surface hover:bg-inverse-on-surface/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-on-surface focus-visible:ring-offset-2 focus-visible:ring-offset-inverse-surface',
    badgePill: 'bg-secondary/90 text-on-secondary',
    trustColor: 'text-inverse-on-surface/35',
  },
}
