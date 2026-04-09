/**
 * Stripe subscription sync utility.
 *
 * Reconciles the Supabase profile with the live Stripe subscription state.
 * Called from the settings page on two occasions:
 *
 *   1. `?checkout=success` — user just paid; activate if Stripe confirms.
 *   2. `?portal=return`    — user returned from the Customer Portal; sync
 *                            whatever changed (cancellation, reactivation…).
 *
 * Uses supabaseAdmin to bypass the RLS trigger guard on sensitive columns.
 *
 * Cancellation policy:
 *   Subscriptions with `cancel_at_period_end = true` are still treated as
 *   active — the user keeps Pro access until the billing period ends.
 *   The actual downgrade happens when Stripe fires `customer.subscription.deleted`
 *   at period end, which is handled by the webhook route.
 */

import { stripe } from '@/lib/stripe/client'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export type SyncResult = { synced: true; active: boolean } | { synced: false }

/**
 * Looks up the Stripe customer, checks for an active or trialing subscription,
 * and updates the profile to match.
 *
 * - Active/trialing subscription found → subscription_active=true,  role='pro'
 * - No active subscription             → subscription_active=false, role='user'
 *   (only when `deactivateIfNotFound` is true — safe after portal return)
 */
export async function syncSubscriptionFromStripe(params: {
  userId: string
  email: string | null | undefined
  existingCustomerId: string | null | undefined
  deactivateIfNotFound?: boolean
}): Promise<SyncResult> {
  const {
    userId,
    email,
    existingCustomerId,
    deactivateIfNotFound = false,
  } = params

  let customerId = existingCustomerId ?? null

  // If we don't have a customer ID yet (webhook hasn't run), find by email.
  if (!customerId && email) {
    try {
      const customers = await stripe.customers.list({ email, limit: 1 })
      customerId = customers.data[0]?.id ?? null
    } catch {
      return { synced: false }
    }
  }

  if (!customerId) {
    if (deactivateIfNotFound) {
      const ok = await deactivateProfile(userId)
      return ok ? { synced: true, active: false } : { synced: false }
    }
    return { synced: false }
  }

  // Fetch active and trialing subscriptions.
  // cancel_at_period_end=true still counts as active — user keeps access
  // until the period ends and `customer.subscription.deleted` fires.
  let isActive = false
  try {
    const [active, trialing] = await Promise.all([
      stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      }),
      stripe.subscriptions.list({
        customer: customerId,
        status: 'trialing',
        limit: 1,
      }),
    ])
    isActive = active.data.length > 0 || trialing.data.length > 0
  } catch {
    return { synced: false }
  }

  if (isActive) {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        stripe_customer_id: customerId,
        subscription_active: true,
        role: 'pro',
      })
      .eq('id', userId)

    if (error) {
      logger.error('stripe-sync', 'Failed to activate profile:', error.message)
      return { synced: false }
    }
    return { synced: true, active: true }
  }

  // No active subscription found.
  if (deactivateIfNotFound) {
    const ok = await deactivateProfile(userId)
    return ok ? { synced: true, active: false } : { synced: false }
  }

  return { synced: false }
}

async function deactivateProfile(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ subscription_active: false, role: 'user' })
    .eq('id', userId)

  if (error) {
    logger.error('stripe-sync', 'Failed to deactivate profile:', error.message)
    return false
  }
  return true
}
