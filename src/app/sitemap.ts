import type { MetadataRoute } from 'next'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://youtube-intelligence.app'

/**
 * Generates /sitemap.xml via the Next.js App Router Metadata API.
 *
 * Only public, indexable pages are included.
 * Authenticated dashboard routes are intentionally excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]
}
