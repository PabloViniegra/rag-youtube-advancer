import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import { Suspense } from 'react'
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://youtube-intelligence.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s — YouTube Intelligence',
    default: 'YouTube Intelligence — Tu Segundo Cerebro para YouTube',
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
  authors: [{ name: 'YouTube Intelligence', url: siteUrl }],
  creator: 'YouTube Intelligence',
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
    siteName: 'YouTube Intelligence',
    locale: 'es_ES',
    title: 'YouTube Intelligence — Tu Segundo Cerebro para YouTube',
    description:
      'Analiza cualquier video de YouTube con IA RAG. Optimiza tu hook, retención y monetización en segundos.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'YouTube Intelligence — Tu Segundo Cerebro para YouTube',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Intelligence — Tu Segundo Cerebro para YouTube',
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
        </ThemeProvider>
      </body>
    </html>
  )
}
