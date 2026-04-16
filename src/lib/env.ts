export const supabaseUrl = (() => {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!v)
    throw new Error(
      'Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL',
    )
  return v
})()

export const supabaseAnonKey = (() => {
  const v = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!v)
    throw new Error(
      'Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY',
    )
  return v
})()

// Vercel AI Gateway — standard SDK env var name is AI_GATEWAY_API_KEY.
// We read NEXT_VERCEL_AI_GATEWAY_API_KEY (server-only) and pass it explicitly
// to createGateway() so we are not forced to rename the variable.
export const aiGatewayApiKey = (() => {
  const v = process.env.NEXT_VERCEL_AI_GATEWAY_API_KEY
  if (!v)
    throw new Error(
      'Missing required environment variable: NEXT_VERCEL_AI_GATEWAY_API_KEY',
    )
  return v
})()

// ── Stripe ────────────────────────────────────────────────────────────────────

export const stripeSecretKey = (() => {
  const v = process.env.NEXT_STRIPE_SECRET_KEY
  if (!v)
    throw new Error(
      'Missing required environment variable: NEXT_STRIPE_SECRET_KEY',
    )
  return v
})()

export const stripePublicKey = (() => {
  const v = process.env.NEXT_STRIPE_PUBLIC_KEY
  if (!v)
    throw new Error(
      'Missing required environment variable: NEXT_STRIPE_PUBLIC_KEY',
    )
  return v
})()

export const stripeProProductId = (() => {
  const v = process.env.NEXT_STRIPE_PRO_PRODUCT_ID
  if (!v)
    throw new Error(
      'Missing required environment variable: NEXT_STRIPE_PRO_PRODUCT_ID',
    )
  return v
})()

export const stripeMaxProductId = (() => {
  const v = process.env.NEXT_STRIPE_MAX_PRODUCT_ID
  if (!v)
    throw new Error(
      'Missing required environment variable: NEXT_STRIPE_MAX_PRODUCT_ID',
    )
  return v
})()

/** Webhook signing secret — required in all environments. */
export const stripeWebhookSecret = (() => {
  const v = process.env.STRIPE_WEBHOOK_SECRET
  if (!v)
    throw new Error(
      'Missing required environment variable: STRIPE_WEBHOOK_SECRET',
    )
  return v
})()

// ── Supabase service role (server-only, bypasses RLS) ─────────────────────────

export const supabaseServiceRoleKey = (() => {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!v)
    throw new Error(
      'Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY',
    )
  return v
})()
