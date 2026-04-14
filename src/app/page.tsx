import type { Metadata } from 'next'
import { BentoGrid } from '@/components/landing/bento-grid'
import { CtaSection } from '@/components/landing/cta-section'
import { Footer } from '@/components/landing/footer'
import { HeroSection } from '@/components/landing/hero-section'
import { InsightSection } from '@/components/landing/insight-section'
import { Navbar } from '@/components/landing/navbar'
import { PricingSection } from '@/components/landing/pricing-section'
import { ProcessSection } from '@/components/landing/process-section'
import { JsonLd } from '@/components/seo/json-ld'
import { getCurrentUser } from '@/lib/auth/actions'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://youtube-intelligence.app'

export const metadata: Metadata = {
  title: 'YouTube Intelligence — Crece más rápido con IA',
  description:
    'Transforma cualquier video de YouTube en conocimiento accionable. Búsqueda semántica, resúmenes IA y análisis RAG para creadores de contenido. 1 video gratis con cuenta free.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'YouTube Intelligence — Crece más rápido con IA',
    description:
      'Transforma cualquier video de YouTube en conocimiento accionable con búsqueda semántica y análisis RAG.',
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'YouTube Intelligence',
  url: siteUrl,
  description:
    'Transforma cualquier video de YouTube en conocimiento accionable con búsqueda semántica y análisis RAG.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/dashboard/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'YouTube Intelligence',
  url: siteUrl,
  logo: `${siteUrl}/opengraph-image`,
  sameAs: [],
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'YouTube Intelligence',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: siteUrl,
  description:
    'SaaS para creadores de contenido que transforma videos de YouTube en un Segundo Cerebro buscable con IA RAG.',
  offers: {
    '@type': 'Offer',
    price: '5.00',
    priceCurrency: 'USD',
    priceValidUntil: '2026-12-31',
    availability: 'https://schema.org/InStock',
  },
}

export default async function Home() {
  const user = await getCurrentUser()
  const isAuthenticated = user !== null

  return (
    <>
      <JsonLd schema={websiteSchema} />
      <JsonLd schema={organizationSchema} />
      <JsonLd schema={softwareSchema} />
      <Navbar isAuthenticated={isAuthenticated} />
      <main id="main-content" className="pt-24">
        <HeroSection isAuthenticated={isAuthenticated} />
        <ProcessSection />
        <BentoGrid />
        <InsightSection />
        <PricingSection />
        <CtaSection isAuthenticated={isAuthenticated} />
      </main>
      <Footer />
    </>
  )
}
