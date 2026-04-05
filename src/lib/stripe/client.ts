import Stripe from 'stripe'
import { stripeSecretKey } from '@/lib/env'

/**
 * Server-side Stripe client singleton.
 * Re-uses the same instance across hot-reloads in development.
 */
function createStripeClient(): Stripe {
  return new Stripe(stripeSecretKey, {
    typescript: true,
  })
}

// Persist across hot reloads in dev
const globalForStripe = globalThis as unknown as { __stripe?: Stripe }

export const stripe = globalForStripe.__stripe ?? createStripeClient()

if (process.env.NODE_ENV !== 'production') {
  globalForStripe.__stripe = stripe
}
