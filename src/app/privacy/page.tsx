import type { Metadata } from 'next'
import { Footer } from '@/components/landing/footer'
import { Navbar } from '@/components/landing/navbar'
import { getCurrentUser } from '@/lib/auth/actions'
import { LegalLayout } from '@/components/legal/legal-layout'
import {
  LegalSection,
  LegalList,
  LegalProviderGrid,
  LegalRightsGrid,
} from '@/components/legal/legal-section'
import { LegalContactCard } from '@/components/legal/legal-contact-card'
import {
  PrivacyProvidedInfo,
  PrivacyAutoCollectedInfo,
} from '@/components/legal/privacy-info-sections'
import {
  PRIVACY_SECTIONS,
  PRIVACY_PROVIDERS,
  PRIVACY_RIGHTS,
  PRIVACY_SECURITY_ITEMS,
  PRIVACY_USAGE_ITEMS,
} from '@/components/legal/privacy-data'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Second Brain',
  description:
    'Política de privacidad de Second Brain. Descubre cómo protegemos tus datos y tu privacidad.',
}

const PRIVACY_EMAIL = 'privacy@youtube-intelligence.app'

export default async function PrivacyPolicy() {
  const user = await getCurrentUser()
  const lastUpdated = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <Navbar isAuthenticated={user !== null} />
      <LegalLayout
        title="Política de Privacidad"
        description="Descubre cómo recopilamos, usamos y protegemos tu información personal."
        lastUpdated={lastUpdated}
        sections={PRIVACY_SECTIONS}
      >
        <LegalSection id="introduccion" num="01" title="Introducción">
          <p>
            En Second Brain (&quot;nosotros&quot;, &quot;nos&quot; o
            &quot;la Plataforma&quot;), nos comprometemos a proteger tu
            privacidad. Esta Política explica cómo recopilamos, usamos,
            divulgamos y protegemos tu información personal.
          </p>
        </LegalSection>

        <LegalSection
          id="informacion"
          num="02"
          title="Información que Recopilamos"
        >
          <PrivacyProvidedInfo />
          <PrivacyAutoCollectedInfo />
        </LegalSection>

        <LegalSection id="uso" num="03" title="Cómo Usamos tu Información">
          <LegalList items={PRIVACY_USAGE_ITEMS} />
        </LegalSection>

        <LegalSection id="compartir" num="04" title="Compartir Información">
          <div className="border-l-2 border-outline-variant pl-5 space-y-3">
            <h3 className="text-sm font-headline font-semibold text-on-surface">
              4.1 Proveedores de servicios
            </h3>
            <p>
              Compartimos información con terceros que nos ayudan a operar la
              Plataforma:
            </p>
            <LegalProviderGrid providers={PRIVACY_PROVIDERS} />
          </div>
          <div className="border-l-2 border-outline-variant pl-5 space-y-3">
            <h3 className="text-sm font-headline font-semibold text-on-surface">
              4.2 Divulgación requerida por ley
            </h3>
            <p>
              Podemos revelar información si la ley lo requiere o si es
              necesario para proteger nuestros derechos o la seguridad de los
              usuarios.
            </p>
          </div>
        </LegalSection>

        <LegalSection
          id="cookies"
          num="05"
          title="Cookies y Tecnologías Similares"
        >
          <p>
            Utilizamos cookies esenciales para el funcionamiento de la
            Plataforma. Puedes configurar tu navegador para rechazarlas, aunque
            algunas funciones podrían no funcionar correctamente.
          </p>
        </LegalSection>

        <LegalSection id="seguridad" num="06" title="Seguridad">
          <p>
            Implementamos medidas técnicas y organizativas para proteger tu
            información:
          </p>
          <LegalList items={PRIVACY_SECURITY_ITEMS} />
        </LegalSection>

        <LegalSection id="retencion" num="07" title="Retención de Datos">
          <p>
            Conservamos tu información mientras tu cuenta esté activa o según
            sea necesario para prestar el servicio. Puedes solicitar la
            eliminación de tus datos en cualquier momento contactándonos.
          </p>
        </LegalSection>

        <LegalSection id="derechos" num="08" title="Tus Derechos">
          <p>Bajo el RGPD y otras normativas aplicables, tienes derecho a:</p>
          <LegalRightsGrid rights={PRIVACY_RIGHTS} />
          <p>
            Para ejercer estos derechos, contacta en{' '}
            <a
              href={`mailto:${PRIVACY_EMAIL}`}
              className="text-primary font-medium hover:underline underline-offset-2 transition-colors"
            >
              {PRIVACY_EMAIL}
            </a>
          </p>
        </LegalSection>

        <LegalSection
          id="transferencias"
          num="09"
          title="Transferencias Internacionales"
        >
          <p>
            Tu información puede ser transferida y procesada en países fuera de
            tu jurisdicción. Implementamos medidas apropiadas para proteger tus
            datos en dichas transferencias, conforme a las normativas
            aplicables.
          </p>
        </LegalSection>

        <LegalSection id="menores" num="10" title="Menores de Edad">
          <p>
            La Plataforma no está dirigida a menores de 18 años. No recopilamos
            intencionalmente información de menores. Si descubrimos que hemos
            recopilado datos de un menor, eliminaremos dicha información.
          </p>
        </LegalSection>

        <LegalSection id="cambios" num="11" title="Cambios a esta Política">
          <p>
            Podemos actualizar esta Política periódicamente. Notificaremos
            cambios significativos publicando la nueva versión en esta página y
            actualizando la fecha de «última actualización».
          </p>
        </LegalSection>

        <LegalSection id="contacto" num="12" title="Contacto">
          <LegalContactCard
            question="¿Tienes preguntas sobre esta Política?"
            description="Estamos disponibles para resolver cualquier duda sobre el tratamiento de tus datos."
            email={PRIVACY_EMAIL}
          />
        </LegalSection>
      </LegalLayout>
      <Footer />
    </>
  )
}
