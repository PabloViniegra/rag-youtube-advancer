import type { Metadata } from 'next'
import { Footer } from '@/components/landing/footer'
import { Navbar } from '@/components/landing/navbar'
import { getCurrentUser } from '@/lib/auth/actions'

export const metadata: Metadata = {
  title: 'Términos de Uso — YouTube Intelligence',
  description:
    'Términos y condiciones de uso de YouTube Intelligence. Lee nuestras políticas antes de usar la plataforma.',
}

export default async function TermsOfService() {
  const user = await getCurrentUser()
  const isAuthenticated = user !== null

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} />
      <main id="main-content" className="pt-32 pb-20 px-6">
        <article className="max-w-3xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-black text-on-surface mb-4">
              Términos de Uso
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
                1. Aceptación de los Términos
              </h2>
              <p className="text-on-surface-variant">
                Al acceder y utilizar YouTube Intelligence (&quot;la
                Plataforma&quot;), aceptas vinculante estos Términos de Uso. Si
                no estás de acuerdo con alguna disposición, no debes utilizar la
                Plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                2. Descripción del Servicio
              </h2>
              <p className="text-on-surface-variant">
                YouTube Intelligence es una plataforma SaaS que permite a
                creadores de contenido transformar videos de YouTube en
                conocimiento accionable mediante tecnologías de IA, incluyendo
                búsqueda semántica, resúmenes automáticos y análisis de
                optimización.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                3. Elegibilidad y Registro
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
                <li>Debes tener al menos 18 años de edad.</li>
                <li>
                  Debes proporcionar información veraz y completa durante el
                  registro.
                </li>
                <li>
                  Eres responsable de mantener la confidencialidad de tu cuenta.
                </li>
                <li>
                  Aceptas notificar inmediatamente cualquier uso no autorizado.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                4. Suscripción y Pagos
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
                <li>
                  El servicio se ofrece por $5.99 USD/mes (o equivalente en tu
                  moneda local).
                </li>
                <li>Se ofrece una prueba gratuita de 14 días.</li>
                <li>
                  La suscripción se renueva automáticamente hasta que canceles.
                </li>
                <li>
                  Puedes cancelar en cualquier momento desde tu panel de
                  usuario.
                </li>
                <li>No hay reembolso por períodos no utilizados.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                5. Uso Aceptable
              </h2>
              <p className="text-on-surface-variant mb-4">
                Te comprometes a NO utilizar la Plataforma para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
                <li>
                  Actividades ilegales o que infrinjan derechos de terceros.
                </li>
                <li>
                  Extraer datos de YouTube de manera que viole sus Términos de
                  Servicio.
                </li>
                <li>Generar contenido engañoso, difamatorio o malicioso.</li>
                <li>Interferir con el funcionamiento de la Plataforma.</li>
                <li>Revender o redistribuir el servicio sin autorización.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                6. Propiedad Intelectual
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-on-surface-variant">
                <li>
                  La Plataforma y todo su contenido son propiedad de YouTube
                  Intelligence.
                </li>
                <li>
                  Los resultados generados por IA son tuyos para usar como
                  desees.
                </li>
                <li>
                  No puedes copiar, modificar o distribuir nuestro código sin
                  autorización.
                </li>
                <li>
                  Las marcas de terceros (incluyendo YouTube) pertenecen a sus
                  respectivos propietarios.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                7. Limitación de Responsabilidad
              </h2>
              <p className="text-on-surface-variant">
                YouTube Intelligence se proporciona &quot;como está&quot;. No
                garantizamos que el servicio esté libre de errores o disponible
                el 100% del tiempo. No somos responsables de decisiones que
                tomes basándote en los análisis o sugerencias generadas por la
                Plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                8. Modificaciones al Servicio
              </h2>
              <p className="text-on-surface-variant">
                Nos reservamos el derecho de modificar, suspender o discontinuar
                cualquier aspecto del servicio en cualquier momento.
                Intentaremos notificar cambios significativos con anticipación
                razonable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                9. Terminación
              </h2>
              <p className="text-on-surface-variant">
                Podemos suspender o terminar tu cuenta si incumples estos
                Términos. También puedes eliminar tu cuenta en cualquier momento
                desde la configuración.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                10. Ley Aplicable
              </h2>
              <p className="text-on-surface-variant">
                Estos Términos se rigen por las leyes de España. Cualquier
                disputa será resuelta en los tribunales de Madrid, España.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                11. Contacto
              </h2>
              <p className="text-on-surface-variant">
                Para preguntas sobre estos Términos, contacta a través de
                nuestro sitio web o por email.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
