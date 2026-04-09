import type { MetadataRoute } from 'next'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://youtube-intelligence.app'

/**
 * Generates /robots.txt via the Next.js App Router Metadata API.
 *
 * Rules:
 * - Allow all public marketing + auth pages for indexing.
 * - Block authenticated dashboard routes, API endpoints, and error pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login'],
        disallow: ['/dashboard/', '/api/', '/auth/error', '/_next/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
