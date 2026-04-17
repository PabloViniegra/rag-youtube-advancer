import type { MetadataRoute } from 'next'

/**
 * Generates /manifest.json via the Next.js App Router Metadata API.
 * Enables "Add to Home Screen" on mobile and improves PWA signals for SEO.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Second Brain',
    short_name: 'Second Brain',
    description:
      'Tu segundo cerebro para YouTube. Analiza videos con IA RAG, genera resúmenes y extrae insights en segundos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#c0392b',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    categories: ['productivity', 'utilities', 'education'],
    lang: 'es',
  }
}
