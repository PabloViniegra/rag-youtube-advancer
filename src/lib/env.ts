function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
export const supabaseAnonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

// Vercel AI Gateway — standard SDK env var name is AI_GATEWAY_API_KEY.
// We read NEXT_VERCEL_AI_GATEWAY_API_KEY (server-only) and pass it explicitly
// to createGateway() so we are not forced to rename the variable.
export const aiGatewayApiKey = requireEnv('NEXT_VERCEL_AI_GATEWAY_API_KEY')
