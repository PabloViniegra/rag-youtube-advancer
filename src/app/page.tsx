import { BentoGrid } from '@/components/landing/bento-grid'
import { CtaSection } from '@/components/landing/cta-section'
import { Footer } from '@/components/landing/footer'
import { HeroSection } from '@/components/landing/hero-section'
import { InsightSection } from '@/components/landing/insight-section'
import { Navbar } from '@/components/landing/navbar'
import { ProcessSection } from '@/components/landing/process-section'
import { getCurrentUser } from '@/lib/auth/actions'

export default async function Home() {
  const user = await getCurrentUser()
  const isAuthenticated = user !== null

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} />
      <main id="main-content" className="pt-24">
        <HeroSection isAuthenticated={isAuthenticated} />
        <ProcessSection />
        <BentoGrid />
        <InsightSection />
        <CtaSection isAuthenticated={isAuthenticated} />
      </main>
      <Footer />
    </>
  )
}
