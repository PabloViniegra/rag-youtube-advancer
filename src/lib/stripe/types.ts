// ── Stripe action result types ────────────────────────────────────────────────

const CHECKOUT_ERROR = {
  NO_USER: 'no_user',
  NO_PROFILE: 'no_profile',
  NO_PRICE: 'no_price',
  STRIPE_ERROR: 'stripe_error',
} as const

type CheckoutErrorCode = (typeof CHECKOUT_ERROR)[keyof typeof CHECKOUT_ERROR]

export { CHECKOUT_ERROR }
export type { CheckoutErrorCode }

const PORTAL_ERROR = {
  NO_USER: 'no_user',
  NO_PROFILE: 'no_profile',
  NO_CUSTOMER: 'no_customer',
  STRIPE_ERROR: 'stripe_error',
} as const

type PortalErrorCode = (typeof PORTAL_ERROR)[keyof typeof PORTAL_ERROR]

export { PORTAL_ERROR }
export type { PortalErrorCode }

// ── Discriminated union results ───────────────────────────────────────────────

export interface CheckoutSuccess {
  ok: true
  url: string
}

export interface CheckoutFailure {
  ok: false
  code: CheckoutErrorCode
  message: string
}

export type CheckoutResult = CheckoutSuccess | CheckoutFailure

export interface PortalSuccess {
  ok: true
  url: string
}

export interface PortalFailure {
  ok: false
  code: PortalErrorCode
  message: string
}

export type PortalResult = PortalSuccess | PortalFailure

// ── Webhook event types we care about ─────────────────────────────────────────

const STRIPE_WEBHOOK_EVENT = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
} as const

type StripeWebhookEvent =
  (typeof STRIPE_WEBHOOK_EVENT)[keyof typeof STRIPE_WEBHOOK_EVENT]

export { STRIPE_WEBHOOK_EVENT }
export type { StripeWebhookEvent }
