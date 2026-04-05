'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { stripeProProductId } from '@/lib/env'
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

// ── Create Checkout Session ──────────────────────────────────────────────────

export async function createCheckoutSession(): Promise<CheckoutResult> {
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

  // Find the active recurring price for the Pro product
  const prices = await stripe.prices.list({
    product: stripeProProductId,
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
      // Link to existing Stripe customer or let Stripe create one
      ...(profile.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : {
            customer_email: profile.email ?? user.email ?? undefined,
            metadata: { supabase_user_id: user.id },
          }),
      subscription_data: {
        metadata: { supabase_user_id: user.id },
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
