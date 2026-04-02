import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'
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
    >
      <body className="bg-background text-on-surface font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
