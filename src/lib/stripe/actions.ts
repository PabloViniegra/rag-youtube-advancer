'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { stripeMaxProductId, stripeProProductId } from '@/lib/env'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { stripe } from './client'
import type { CheckoutResult, PortalResult } from './types'
import { CHECKOUT_ERROR, PORTAL_ERROR } from './types'

type Profile = Database['public']['Tables']['profiles']['Row']

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getOrigin(): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

// ── Create Checkout Session (generic) ────────────────────────────────────────

async function createCheckoutSessionForProduct(
  productId: string,
  planTier: 'pro' | 'max',
): Promise<CheckoutResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false,
      code: CHECKOUT_ERROR.NO_USER,
      message: 'No autenticado.',
    }
  }

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('id, email, stripe_customer_id')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as unknown as Pick<
    Profile,
    'id' | 'email' | 'stripe_customer_id'
  > | null

  if (!profile) {
    return {
      ok: false,
      code: CHECKOUT_ERROR.NO_PROFILE,
      message: 'Perfil no encontrado.',
    }
  }

  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    type: 'recurring',
    limit: 1,
  })

  const price = prices.data[0]

  if (!price) {
    return {
      ok: false,
      code: CHECKOUT_ERROR.NO_PRICE,
      message: 'No se encontró un precio activo.',
    }
  }

  const origin = await getOrigin()

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${origin}/dashboard/settings?checkout=success`,
      cancel_url: `${origin}/dashboard/settings?checkout=cancelled`,
      ...(profile.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : {
            customer_email: profile.email ?? user.email ?? undefined,
          }),
      metadata: { supabase_user_id: user.id, plan_tier: planTier },
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan_tier: planTier },
      },
    })

    if (!session.url) {
      return {
        ok: false,
        code: CHECKOUT_ERROR.STRIPE_ERROR,
        message: 'Stripe no devolvió URL.',
      }
    }

    return { ok: true, url: session.url }
  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
        : 'Error al crear la sesión de pago.'
    return { ok: false, code: CHECKOUT_ERROR.STRIPE_ERROR, message: msg }
  }
}

// ── Plan-specific checkout sessions ──────────────────────────────────────────

export async function createCheckoutSession(): Promise<CheckoutResult> {
  return createCheckoutSessionForProduct(stripeProProductId, 'pro')
}

export async function createCheckoutSessionMax(): Promise<CheckoutResult> {
  return createCheckoutSessionForProduct(stripeMaxProductId, 'max')
}

// ── Create Customer Portal Session ───────────────────────────────────────────

export async function createPortalSession(): Promise<PortalResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, code: PORTAL_ERROR.NO_USER, message: 'No autenticado.' }
  }

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as unknown as Pick<
    Profile,
    'stripe_customer_id'
  > | null

  if (!profile) {
    return {
      ok: false,
      code: PORTAL_ERROR.NO_PROFILE,
      message: 'Perfil no encontrado.',
    }
  }

  if (!profile.stripe_customer_id) {
    return {
      ok: false,
      code: PORTAL_ERROR.NO_CUSTOMER,
      message: 'No tienes una suscripción activa.',
    }
  }

  const origin = await getOrigin()

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/dashboard/settings?portal=return`,
    })

    return { ok: true, url: session.url }
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Error al abrir el portal.'
    return { ok: false, code: PORTAL_ERROR.STRIPE_ERROR, message: msg }
  }
}

// ── Redirect wrappers (for form actions) ─────────────────────────────────────

export async function redirectToCheckout(): Promise<never> {
  const result = await createCheckoutSession()
  if (result.ok) {
    redirect(result.url)
  }
  redirect(
    `/dashboard/settings?checkout=error&message=${encodeURIComponent(result.message)}`,
  )
}

export async function redirectToPortal(): Promise<never> {
  const result = await createPortalSession()
  if (result.ok) {
    redirect(result.url)
  }
  redirect(
    `/dashboard/settings?checkout=error&message=${encodeURIComponent(result.message)}`,
  )
}

export async function redirectToCheckoutMax(): Promise<never> {
  const result = await createCheckoutSessionMax()
  if (result.ok) {
    redirect(result.url)
  }
  redirect(
    `/dashboard/settings?checkout=error&message=${encodeURIComponent(result.message)}`,
  )
}

// ── Pro → Max upgrade (updates existing subscription, avoids currency conflict) ─

export type UpgradeResult = { ok: true } | { ok: false; message: string }

export async function upgradeToMax(): Promise<UpgradeResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: 'No autenticado.' }
  }

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('id, stripe_customer_id')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as unknown as Pick<
    Database['public']['Tables']['profiles']['Row'],
    'id' | 'stripe_customer_id'
  > | null

  if (!profile?.stripe_customer_id) {
    return { ok: false, message: 'No tienes una suscripcion activa.' }
  }

  // List active subscriptions for this customer
  const subscriptions = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status: 'active',
    limit: 1,
  })

  const sub = subscriptions.data[0]

  if (!sub) {
    return { ok: false, message: 'No se encontro una suscripcion activa.' }
  }

  // Get the currency of the existing subscription from the first item's price
  const currentItem = sub.items.data[0]
  const currentCurrency = currentItem.price.currency

  // List Max prices and find one matching the subscription's currency
  const maxPrices = await stripe.prices.list({
    product: stripeMaxProductId,
    active: true,
    type: 'recurring',
  })

  const matchingPrice = maxPrices.data.find(
    (p) => p.currency === currentCurrency,
  )

  if (!matchingPrice) {
    return {
      ok: false,
      message: 'No hay precio Max disponible en tu moneda. Contacta soporte.',
    }
  }

  await stripe.subscriptions.update(sub.id, {
    items: [{ id: currentItem.id, price: matchingPrice.id }],
    proration_behavior: 'create_prorations',
    metadata: { plan_tier: 'max', supabase_user_id: user.id },
  })

  await supabaseAdmin.from('profiles').update({ role: 'max' }).eq('id', user.id)

  return { ok: true }
}

export async function redirectToUpgradeMax(): Promise<never> {
  const result = await upgradeToMax()
  if (result.ok) {
    redirect('/dashboard/settings?checkout=success')
  }
  redirect(
    `/dashboard/settings?checkout=error&message=${encodeURIComponent(result.message)}`,
  )
}
