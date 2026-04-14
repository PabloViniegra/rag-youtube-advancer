import '@testing-library/jest-dom/vitest'

process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'test-anon-key'
process.env.NEXT_VERCEL_AI_GATEWAY_API_KEY =
  process.env.NEXT_VERCEL_AI_GATEWAY_API_KEY ?? 'test-ai-key'
process.env.NEXT_STRIPE_SECRET_KEY =
  process.env.NEXT_STRIPE_SECRET_KEY ?? 'sk_test_123'
process.env.NEXT_STRIPE_PUBLIC_KEY =
  process.env.NEXT_STRIPE_PUBLIC_KEY ?? 'pk_test_123'
process.env.NEXT_STRIPE_PRO_PRODUCT_ID =
  process.env.NEXT_STRIPE_PRO_PRODUCT_ID ?? 'prod_test_123'
process.env.NEXT_STRIPE_MAX_PRODUCT_ID =
  process.env.NEXT_STRIPE_MAX_PRODUCT_ID ?? 'prod_max_test_123'
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'service-role-test-key'
