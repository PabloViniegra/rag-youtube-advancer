import type { Metadata } from 'next'
import { Footer } from '@/components/landing/footer'
import { Navbar } from '@/components/landing/navbar'
import { getCurrentUser } from '@/lib/auth/actions'
import { LegalLayout } from '@/components/legal/legal-layout'
import { LegalSection, LegalList } from '@/components/legal/legal-section'
import { LegalContactCard } from '@/components/legal/legal-contact-card'

export const metadata: Metadata = {
  title: 'Términos de Uso — Second Brain',
  description:
    'Términos y condiciones de uso de Second Brain. Lee nuestras políticas antes de usar la plataforma.',
}

const SECTIONS = [
  { id: 'aceptacion', title: 'Aceptación de los Términos' },
  { id: 'descripcion', title: 'Descripción del Servicio' },
  { id: 'elegibilidad', title: 'Elegibilidad y Registro' },
  { id: 'pagos', title: 'Suscripción y Pagos' },
  { id: 'uso-aceptable', title: 'Uso Aceptable' },
  { id: 'propiedad', title: 'Propiedad Intelectual' },
  { id: 'responsabilidad', title: 'Limitación de Responsabilidad' },
  { id: 'modificaciones', title: 'Modificaciones al Servicio' },
  { id: 'terminacion', title: 'Terminación' },
  { id: 'ley', title: 'Ley Aplicable' },
  { id: 'contacto', title: 'Contacto' },
]

export default async function TermsOfService() {
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
        title="Términos de Uso"
        description="Condiciones que rigen el uso de la plataforma Second Brain."
        lastUpdated={lastUpdated}
        sections={SECTIONS}
      >
        <LegalSection
          id="aceptacion"
          num="01"
          title="Aceptación de los Términos"
        >
          <p>
            Al acceder y utilizar Second Brain (&quot;la
            Plataforma&quot;), aceptas de forma vinculante estos Términos de
            Uso. Si no estás de acuerdo con alguna disposición, no debes
            utilizar la Plataforma.
          </p>
        </LegalSection>

        <LegalSection
          id="descripcion"
          num="02"
          title="Descripción del Servicio"
        >
          <p>
            Second Brain es una plataforma SaaS que permite a creadores
            de contenido transformar videos de YouTube en conocimiento
            accionable mediante tecnologías de IA, incluyendo búsqueda
            semántica, resúmenes automáticos y análisis de optimización.
          </p>
        </LegalSection>

        <LegalSection
          id="elegibilidad"
          num="03"
          title="Elegibilidad y Registro"
        >
          <LegalList
            items={[
              'Debes tener al menos 18 años de edad.',
              'Debes proporcionar información veraz y completa durante el registro.',
              'Eres responsable de mantener la confidencialidad de tu cuenta.',
              'Aceptas notificar inmediatamente cualquier uso no autorizado.',
            ]}
          />
        </LegalSection>

        <LegalSection id="pagos" num="04" title="Suscripción y Pagos">
          <LegalList
            items={[
              'El servicio se ofrece por €5.99/mes (o equivalente en tu moneda local).',
              'Se ofrece una prueba gratuita de 14 días sin cargo.',
              'La suscripción se renueva automáticamente hasta que canceles.',
              'Puedes cancelar en cualquier momento desde tu panel de usuario.',
              'No hay reembolso por períodos no utilizados.',
            ]}
          />
        </LegalSection>

        <LegalSection id="uso-aceptable" num="05" title="Uso Aceptable">
          <p>
            Te comprometes a{' '}
            <strong className="text-on-surface font-semibold">NO</strong>{' '}
            utilizar la Plataforma para:
          </p>
          <LegalList
            items={[
              'Actividades ilegales o que infrinjan derechos de terceros.',
              'Extraer datos de YouTube de manera que viole sus Términos de Servicio.',
              'Generar contenido engañoso, difamatorio o malicioso.',
              'Interferir con el funcionamiento de la Plataforma.',
              'Revender o redistribuir el servicio sin autorización.',
            ]}
          />
        </LegalSection>

        <LegalSection id="propiedad" num="06" title="Propiedad Intelectual">
          <LegalList
            items={[
              'La Plataforma y todo su contenido son propiedad de Second Brain.',
              'Los resultados generados por IA son tuyos para usar como desees.',
              'No puedes copiar, modificar o distribuir nuestro código sin autorización.',
              'Las marcas de terceros (incluyendo YouTube) pertenecen a sus respectivos propietarios.',
            ]}
          />
        </LegalSection>

        <LegalSection
          id="responsabilidad"
          num="07"
          title="Limitación de Responsabilidad"
        >
          <p>
            Second Brain se proporciona &quot;como está&quot;. No
            garantizamos que el servicio esté libre de errores o disponible el
            100% del tiempo. No somos responsables de decisiones que tomes
            basándote en los análisis o sugerencias de la Plataforma.
          </p>
        </LegalSection>

        <LegalSection
          id="modificaciones"
          num="08"
          title="Modificaciones al Servicio"
        >
          <p>
            Nos reservamos el derecho de modificar, suspender o discontinuar
            cualquier aspecto del servicio en cualquier momento. Intentaremos
            notificar cambios significativos con anticipación razonable.
          </p>
        </LegalSection>

        <LegalSection id="terminacion" num="09" title="Terminación">
          <p>
            Podemos suspender o terminar tu cuenta si incumples estos Términos.
            También puedes eliminar tu cuenta en cualquier momento desde la
            configuración.
          </p>
        </LegalSection>

        <LegalSection id="ley" num="10" title="Ley Aplicable">
          <p>
            Estos Términos se rigen por las leyes de España. Cualquier disputa
            será resuelta en los tribunales de Madrid, España.
          </p>
        </LegalSection>

        <LegalSection id="contacto" num="11" title="Contacto">
          <LegalContactCard
            question="¿Tienes preguntas sobre estos Términos?"
            description="Contáctanos a través de nuestro sitio web o por email."
            email="legal@second-brain.app"
          />
        </LegalSection>
      </LegalLayout>
      <Footer />
    </>
  )
}
