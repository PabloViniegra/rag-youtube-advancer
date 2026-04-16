import type { MetadataRoute } from 'next'

/**
 * Resolve the site base URL.
 * Empty string env vars are treated as "not set" and fall back to the
 * production default so tests can stub the env without breaking the fallback.
 */
export function resolveSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL
  return env && env.length > 0 ? env : 'https://youtube-intelligence.app'
}

/**
 * Generates /sitemap.xml via the Next.js App Router Metadata API.
 *
 * Rules:
 * - Only public, indexable pages are listed here.
 * - noindex pages (/login, /auth/error) are intentionally excluded.
 * - Authenticated dashboard routes are intentionally excluded.
 * - API routes are intentionally excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = resolveSiteUrl()

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]
}
