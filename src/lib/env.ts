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
