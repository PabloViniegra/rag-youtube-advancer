import type { Metadata } from 'next'
import { Footer } from '@/components/landing/footer'
import { Navbar } from '@/components/landing/navbar'
import { getCurrentUser } from '@/lib/auth/actions'

export const metadata: Metadata = {
  title: 'Política de Privacidad — YouTube Intelligence',
  description:
    'Política de privacidad de YouTube Intelligence. Desc cómo protegemos tus datos y tu privacidad.',
}

export default async function PrivacyPolicy() {
  const user = await getCurrentUser()
  const isAuthenticated = user !== null

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} />
      <main id="main-content" className="pt-32 pb-20 px-6">
        <article className="max-w-3xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-black text-on-surface mb-4">
              Política de Privacidad
            </h1>
            <p className="text-on-surface-variant font-body">
              Última actualización:{' '}
              {new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </header>

          <div className="prose prose-lg prose-slate max-w-none space-y-8 font-body">
            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                1. Introducción
              </h2>
              <p className="text-on-surface-variant">
                En YouTube Intelligence (&quot;nosotros&quot;, &quot;nos&quot; o
                &quot;la Plataforma&quot;), nos comprometemos a proteger tu
                privacidad. Esta Política de Privacidad explica cómo
                recopilamos, usamos, divulgamos y protegemos tu información
                personal.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                2. Información que Recopilamos
              </h2>
              <h3 className="text-lg font-headline font-semibold text-on-surface mt-6">
                2.1 Información que nos proporcionas
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
                <li>
                  <strong>Cuenta:</strong> Email, nombre, foto de perfil (si
                  usas OAuth).
                </li>
                <li>
                  <strong>Pagos:</strong> Datos de facturación procesados por
                  Stripe (no almacenamos datos de tarjeta).
                </li>
                <li>
                  <strong>Contenido:</strong> URLs de videos de YouTube que
                  analizas y cualquier contenido que generes.
                </li>
              </ul>

              <h3 className="text-lg font-headline font-semibold text-on-surface mt-6">
                2.2 Información recopilada automáticamente
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
                <li>
                  <strong>Datos de uso:</strong> Páginas visitadas, funciones
                  utilizadas, tiempo de sesión.
                </li>
                <li>
                  <strong>Cookies:</strong> Preferencias y configuración de
                  sesión.
                </li>
                <li>
                  <strong>Logs:</strong> Dirección IP, tipo de navegador,
                  sistema operativo.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                3. Cómo Usamos tu Información
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
                <li>Proporcionar, mantener y mejorar la Plataforma.</li>
                <li>Procesar transacciones y gestionar suscripciones.</li>
                <li>
                  Personalizar tu experiencia y mostrar contenido relevante.
                </li>
                <li>Comunicarte sobre actualizaciones, soporte y seguridad.</li>
                <li>
                  Detectar y prevenir actividades fraudulentas o abusivas.
                </li>
                <li>Cumplir con obligaciones legales.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                4. Compartir Información
              </h2>
              <h3 className="text-lg font-headline font-semibold text-on-surface mt-6">
                4.1 Proveedores de servicios
              </h3>
              <p className="text-on-surface-variant">
                Compartimos información con terceros que nos ayudan a operar la
                Plataforma:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
                <li>
                  <strong>Supabase:</strong> Base de datos y autenticación.
                </li>
                <li>
                  <strong>Stripe:</strong> Procesamiento de pagos.
                </li>
                <li>
                  <strong>Vercel:</strong> Alojamiento e infraestructura.
                </li>
                <li>
                  <strong>OpenAI/Vercel AI Gateway:</strong> Generación de
                  análisis mediante IA.
                </li>
              </ul>

              <h3 className="text-lg font-headline font-semibold text-on-surface mt-6">
                4.2 Divulgación requerida por ley
              </h3>
              <p className="text-on-surface-variant">
                Podemos revelar información si la ley lo requiere o si es
                necesario para proteger nuestros derechos o la seguridad de los
                usuarios.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                5. Cookies y Tecnologías Similares
              </h2>
              <p className="text-on-surface-variant">
                Utilizamos cookies esenciales para el funcionamiento de la
                Plataforma. Puedes configurar tu navegador para rechazar
                cookies, aunque algunas funciones podrían no funcionar
                correctamente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                6. Seguridad
              </h2>
              <p className="text-on-surface-variant">
                Implementamos medidas técnicas y organizativas para proteger tu
                información:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
                <li>Cifrado en tránsito (HTTPS/TLS).</li>
                <li>Almacenamiento cifrado en bases de datos.</li>
                <li>Control de acceso basado en roles.</li>
                <li>Monitoreo de seguridad continuo.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                7. Retención de Datos
              </h2>
              <p className="text-on-surface-variant">
                Conservamos tu información mientras tu cuenta esté activa o
                según sea necesario para提供服务. Puedes solicitar la
                eliminación de tus datos en cualquier momento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                8. Tus Derechos
              </h2>
              <p className="text-on-surface-variant mb-4">
                Bajo el RGPD (Reglamento General de Protección de Datos) y otras
                normativas aplicables, tienes derecho a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
                <li>
                  <strong>Acceso:</strong> Solicitar una copia de tus datos.
                </li>
                <li>
                  <strong>Rectificación:</strong> Solicitar corrección de datos
                  incorrectos.
                </li>
                <li>
                  <strong>Eliminación:</strong> Solicitar la eliminación de tus
                  datos (&quot;derecho al olvido&quot;).
                </li>
                <li>
                  <strong>Portabilidad:</strong> Recibir tus datos en formato
                  estructurado.
                </li>
                <li>
                  <strong>Oposición:</strong> Opponerte al procesamiento de tus
                  datos.
                </li>
                <li>
                  <strong>Revocación:</strong> Retirar tu consentimiento en
                  cualquier momento.
                </li>
              </ul>
              <p className="text-on-surface-variant mt-4">
                Para ejercer estos derechos, contacta a través de nuestro sitio
                web o envía un email a privacy@youtube-intelligence.app
              </p>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                9. Transferencias Internacionales
              </h2>
              <p className="text-on-surface-variant">
                Tu información puede ser transferida y procesada en países fuera
                de tu jurisdicción. Estos países pueden tener leyes de
                protección de datos diferentes. Implementamos medidas apropiadas
                para proteger tus datos en dichas transferencias.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                10. Menores de Edad
              </h2>
              <p className="text-on-surface-variant">
                La Plataforma no está dirigida a menores de 18 años. No
                recopilamos intencionalmente información de menores. Si
                descubrimos que hemos recopilado datos de un menor, eliminaremos
                dicha información.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                11. Cambios a esta Política
              </h2>
              <p className="text-on-surface-variant">
                Podemos actualizar esta Política de Privacidad periódicamente.
                Notificaremos cambios significativos publicando la nueva
                política en esta página y actualizando la fecha de &quot;última
                actualización&quot;.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                12. Contacto
              </h2>
              <p className="text-on-surface-variant">
                Si tienes preguntas sobre esta Política de Privacidad, contacta
                a través de nuestro sitio web o envía un email a
                privacy@youtube-intelligence.app
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
