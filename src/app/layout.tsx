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

export const metadata: Metadata = {
  title: 'YouTube Intelligence — Crece más rápido con IA',
  description:
    'Analiza cualquier video de YouTube con IA RAG. Optimiza tu hook, retención y monetización en segundos. Prueba gratis durante 14 días.',
  openGraph: {
    title: 'YouTube Intelligence — Crece más rápido con IA',
    description:
      'Analiza cualquier video de YouTube con IA RAG. Optimiza tu hook, retención y monetización en segundos.',
    type: 'website',
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
