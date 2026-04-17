import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import { Suspense } from 'react'
import { CookieConsent } from '@/components/cookie-consent/cookie-consent'
import { ThemeProvider } from '@/components/providers/theme-provider'
import './globals.css'

// Outfit — geometric with rounded terminals, bold without feeling angular
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

// Plus Jakarta Sans — humanist, rounded quality, warmer than DM Sans
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://second-brain.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s — Second Brain',
    default: 'Second Brain — La IA para creadores de YouTube',
  },
  description:
    'Analiza cualquier video de YouTube con IA RAG. Optimiza tu hook, retención y monetización en segundos. Prueba gratis durante 14 días.',
  keywords: [
    'YouTube',
    'inteligencia artificial',
    'IA',
    'RAG',
    'análisis de video',
    'creadores de contenido',
    'segundo cerebro',
    'resúmenes automáticos',
    'búsqueda semántica',
    'transcripciones YouTube',
  ],
  authors: [{ name: 'Second Brain', url: siteUrl }],
  creator: 'Second Brain',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': 160,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Second Brain',
    locale: 'es_ES',
    title: 'Second Brain — La IA para creadores de YouTube',
    description:
      'Analiza cualquier video de YouTube con IA RAG. Optimiza tu hook, retención y monetización en segundos.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Second Brain — La IA para creadores de YouTube',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Second Brain — La IA para creadores de YouTube',
    description:
      'Analiza cualquier video de YouTube con IA RAG. Optimiza tu hook, retención y monetización en segundos.',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${plusJakartaSans.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen overflow-x-hidden bg-background font-body text-on-surface antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Suspense boundary allows dynamic routes (dashboard, auth) to
              stream in their content while the static shell is prerendered. */}
          <Suspense>{children}</Suspense>
          {/* Cookie consent banner — rendered client-side after hydration */}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  )
}
