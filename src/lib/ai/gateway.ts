/**
 * Vercel AI Gateway client.
 *
 * We use createGateway() from 'ai' to pass the API key explicitly from our
 * custom env var (NEXT_VERCEL_AI_GATEWAY_API_KEY) instead of relying on the
 * SDK's default AI_GATEWAY_API_KEY lookup.
 *
 * This keeps full control over the key name without renaming the variable.
 */
import { createGateway } from 'ai'
import { aiGatewayApiKey } from '@/lib/env'

export const aiGateway = createGateway({
  apiKey: aiGatewayApiKey,
})
