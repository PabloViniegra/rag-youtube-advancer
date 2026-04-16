import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripeMaxProductId, stripeWebhookSecret } from '@/lib/env'
import { logger } from '@/lib/logger'
import { stripe } from '@/lib/stripe/client'
import { STRIPE_WEBHOOK_EVENT } from '@/lib/stripe/types'
import { supabaseAdmin } from '@/lib/supabase/admin'

// ── Webhook handler ──────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('stripe-webhook', 'Signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case STRIPE_WEBHOOK_EVENT.CHECKOUT_COMPLETED:
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        )
        break

      case STRIPE_WEBHOOK_EVENT.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        )
        break

      case STRIPE_WEBHOOK_EVENT.SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        )
        break

      case STRIPE_WEBHOOK_EVENT.INVOICE_PAID:
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case STRIPE_WEBHOOK_EVENT.INVOICE_PAYMENT_FAILED:
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        // Unhandled event type — acknowledge receipt
        break
    }
  } catch (error) {
    logger.error('stripe-webhook', `Error handling ${event.type}:`, error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    )
  }

  return NextResponse.json({ received: true })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Map a Stripe product ID to the DB role value. */
function roleForProductId(productId: string | undefined | null): 'max' | 'pro' {
  return productId === stripeMaxProductId ? 'max' : 'pro'
}

/** Extract the product ID from the first item of a subscription. */
function productIdFromSubscription(
  subscription: Stripe.Subscription,
): string | undefined {
  const product = subscription.items.data[0]?.price?.product
  return typeof product === 'string' ? product : product?.id
}

// ── Event handlers ───────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id

  // plan_tier is set in session metadata when creating the checkout session
  const planTier = session.metadata?.plan_tier as 'pro' | 'max' | undefined
  const role = planTier === 'max' ? 'max' : 'pro'

  // Get the Supabase user ID from session metadata
  const userId = session.metadata?.supabase_user_id

  if (!userId) {
    // Try to find user by customer ID in our DB
    if (customerId) {
      await activateByCustomerId(customerId, role)
    }
    return
  }

  // Link stripe_customer_id and activate subscription
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      stripe_customer_id: customerId ?? null,
      subscription_active: true,
      role,
    })
    .eq('id', userId)

  if (error) {
    logger.error(
      'stripe-webhook',
      'Failed to update profile on checkout:',
      error,
    )
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id

  if (!customerId) return

  // cancel_at_period_end=true still counts as active — the user keeps access
  // until the period ends. Actual downgrade happens via subscription.deleted.
  const isActive =
    subscription.status === 'active' || subscription.status === 'trialing'

  const role = isActive
    ? roleForProductId(productIdFromSubscription(subscription))
    : 'user'

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_active: isActive,
      role,
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    logger.error(
      'stripe-webhook',
      'Failed to update subscription status:',
      error,
    )
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id

  if (!customerId) return

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ subscription_active: false, role: 'user' })
    .eq('stripe_customer_id', customerId)

  if (error) {
    logger.error('stripe-webhook', 'Failed to deactivate subscription:', error)
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id

  if (!customerId) return

  // Detect role from the active subscription's product
  let role: 'pro' | 'max' = 'pro'
  try {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    })
    const sub = subs.data[0]
    if (sub) role = roleForProductId(productIdFromSubscription(sub))
  } catch {
    // Fall back to 'pro' — activateByCustomerId will keep the subscription live
  }

  await activateByCustomerId(customerId, role)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id

  if (!customerId) return

  logger.warn('stripe-webhook', `Payment failed for customer ${customerId}`)

  // Optionally deactivate on payment failure — Stripe will retry, so we only
  // log here. Deactivation happens via subscription.deleted when Stripe
  // exhausts retries.
}

async function activateByCustomerId(
  customerId: string,
  role: 'pro' | 'max' = 'pro',
) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ subscription_active: true, role })
    .eq('stripe_customer_id', customerId)

  if (error) {
    logger.error('stripe-webhook', 'Failed to activate by customer ID:', error)
  }
}
