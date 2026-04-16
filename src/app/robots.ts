import type { MetadataRoute } from 'next'

/**
 * Resolve the site base URL.
 * Empty string env vars are treated as "not set" so that tests can stub
 * the env without triggering the production fallback URL accidentally.
 */
function resolveSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL
  return env && env.length > 0 ? env : 'https://youtube-intelligence.app'
}

/**
 * Generates /robots.txt via the Next.js App Router Metadata API.
 *
 * Rules:
 * - Allow all public marketing pages for indexing.
 * - Block authenticated dashboard routes, API endpoints, Next.js internals,
 *   and auth error pages (these are either private or have no SEO value).
 * - Note: /login is intentionally NOT in the allow list since it is noindex.
 *   Crawlers can still discover it via links — we just don't explicitly
 *   invite them to crawl it via robots.txt.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = resolveSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/dashboard/', '/api/', '/auth/error', '/_next/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
