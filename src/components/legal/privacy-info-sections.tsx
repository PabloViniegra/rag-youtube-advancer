import { LegalSubsection } from './legal-section'
import { LegalList } from './legal-section'

function bold(label: string) {
  return <strong className="text-on-surface font-semibold">{label}</strong>
}

export function PrivacyProvidedInfo() {
  return (
    <LegalSubsection title="2.1 Información que nos proporcionas">
      <LegalList
        items={[
          <>{bold('Cuenta:')} Email, nombre, foto de perfil (si usas OAuth).</>,
          <>
            {bold('Pagos:')} Datos de facturación procesados por Stripe (no
            almacenamos datos de tarjeta).
          </>,
          <>
            {bold('Contenido:')} URLs de videos de YouTube que analizas y
            contenido generado.
          </>,
        ]}
      />
    </LegalSubsection>
  )
}

export function PrivacyAutoCollectedInfo() {
  return (
    <LegalSubsection title="2.2 Información recopilada automáticamente">
      <LegalList
        items={[
          <>
            {bold('Datos de uso:')} Páginas visitadas, funciones utilizadas,
            tiempo de sesión.
          </>,
          <>{bold('Cookies:')} Preferencias y configuración de sesión.</>,
          <>
            {bold('Logs:')} Dirección IP, tipo de navegador, sistema operativo.
          </>,
        ]}
      />
    </LegalSubsection>
  )
}
