import { Wand2 } from 'lucide-react'
import Image from 'next/image'

export function BentoGrid() {
  return (
    <section className="px-6 py-24 max-w-7xl mx-auto">
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-headline font-extrabold mb-4">
          Herramientas de Inteligencia
        </h2>
        <p className="text-on-surface-variant">
          Optimización quirúrgica para cada aspecto de tu canal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main analytics card */}
        <div className="md:col-span-8 bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/40 flex flex-col min-h-[300px]">
          <div className="p-8">
            <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-wider mb-4 inline-block">
              Destacado
            </span>
            <h3 className="text-2xl font-headline font-bold mb-2">
              Análisis Predictivo de Retención
            </h3>
            <p className="text-on-surface-variant text-sm">
              Visualiza los puntos de fuga antes de publicar.
            </p>
          </div>
          <div className="mt-auto px-8 pb-8">
            <div className="relative h-48 bg-surface-container-highest rounded-2xl overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6i84HsJgoPXi9WbUivShOuOZfeBCIP7qFv-14jI4EVUbHcEWNITuu50XXa63LyhkZ7wUrYGUVRoOmHoG2pqEywW2n9wyjI-RgyrbUKgXBvknztbnDoPEP2UxhVlVDso5omq7sYax9nzb2t1Rg_swjIcq4TJ4nBFeGVqBIp-AfClMCTsbanWPzIFlPWxrI7i7o9zpCB4bzDRVGt4CwYveEvnhlHEpUOzYrSew1kYl1jBFN-52DQT26V-KiZSalGNL0Yhvum4rYVuFK"
                alt="Dashboard de retención de audiencia mostrando análisis predictivo de puntos de abandono"
                fill
                className="object-cover opacity-60"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
            </div>
          </div>
        </div>

        {/* Hook generator card */}
        <div className="md:col-span-4 bg-surface-container-low rounded-3xl p-8 border border-outline-variant/40 flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
            <Wand2 className="text-primary" size={20} />
          </div>
          <h3 className="text-xl font-headline font-bold mb-4">
            Hook Generator
          </h3>
          <div className="space-y-2">
            <div className="p-3 bg-primary-container rounded-lg text-xs font-body text-on-primary-container">
              &ldquo;Lo que nadie te contó sobre...&rdquo;
            </div>
            <div className="p-3 bg-primary-container rounded-lg text-xs font-body text-on-primary-container">
              &ldquo;El error que te está costando...&rdquo;
            </div>
            <div className="p-3 bg-surface-container-highest rounded-lg text-xs font-body text-on-surface-variant opacity-50">
              Generando más hooks...
            </div>
          </div>
        </div>

        {/* SEO Optimizer */}
        <div className="md:col-span-4 bg-surface-container-low rounded-3xl p-8 border border-outline-variant/40">
          <h3 className="text-xl font-headline font-bold mb-2">
            SEO Optimizer
          </h3>
          <p className="text-on-surface-variant text-sm mb-6">
            Títulos y descripciones que rankean.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-surface-container-highest text-[10px] text-tertiary border border-tertiary/20">
              #youtube_tips
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-container-highest text-[10px] text-tertiary border border-tertiary/20">
              #ai_growth
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-container-highest text-[10px] text-tertiary border border-tertiary/20">
              #passive_income
            </span>
          </div>
        </div>

        {/* Thumbnail engine */}
        <div className="md:col-span-8 bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/40 flex items-center p-8">
          <div className="w-1/2">
            <h3 className="text-xl font-headline font-bold mb-2">
              Thumbnail Engine
            </h3>
            <p className="text-on-surface-variant text-sm">
              Conceptos visuales basados en psicología de clics.
            </p>
          </div>
          <div className="w-1/2 flex gap-4 overflow-hidden">
            <div className="w-32 h-24 bg-surface-container-highest rounded-lg shrink-0 relative overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAKViVs3oClIFHPCKuGwfdZxEt4T4zPrbM11g0D9v_S-RT-428kiM1KJQa87czaR3IT0IUwknj-7h-3tjjSALlm1ILjXZ6Rx4h2X-VOowVPVE8Lik133yUhKnwOfFRUgkwh9121wkZptrJ5d5SVMG7QOW9hHtLYXESEtK-lVCO3sBT2FvemXRXC8xM93w8JBXr3maD8gUkU5KYssEHgkfLde3x-YJkMDOV2jp1Jb4DkFR-0-Q7elh7CA0HW3umx1hW23AL3cmemu9q"
                alt="Futuristic YouTube logo thumbnail concept with neon red lighting"
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            <div className="w-32 h-24 bg-surface-container-highest rounded-lg shrink-0 relative overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWypcPi2WWVkI6q95c9j5rRWZesBwAegw6RREHeVDCoxwx6dQRH35y-u66slWUKkpkQKL82RiTeAgRV22dYO2TLZtlWJwOwZBGEuposSQJdEA5jbzXxlfGpm7Gxn6bOoqKS81r9xXupSXb1kINh7iCzn-drLaz55bMW8zckPb15WhEjxbGOWsaA5_gJHyP-pf2DPh7SxEOgsFOCVcbT7J1tFjb76R4HEwck8mY4lVYixRTPvNEU5BDxSX4OWv3Dj1qLFANOEuG4Vla"
                alt="Content creator thumbnail with vibrant cinematic lighting"
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
