export const PRIVACY_SECTIONS = [
  { id: 'introduccion', title: 'Introducción' },
  { id: 'informacion', title: 'Información que Recopilamos' },
  { id: 'uso', title: 'Cómo Usamos tu Información' },
  { id: 'compartir', title: 'Compartir Información' },
  { id: 'cookies', title: 'Cookies y Tecnologías Similares' },
  { id: 'seguridad', title: 'Seguridad' },
  { id: 'retencion', title: 'Retención de Datos' },
  { id: 'derechos', title: 'Tus Derechos' },
  { id: 'transferencias', title: 'Transferencias Internacionales' },
  { id: 'menores', title: 'Menores de Edad' },
  { id: 'cambios', title: 'Cambios a esta Política' },
  { id: 'contacto', title: 'Contacto' },
]

export const PRIVACY_PROVIDERS = [
  { name: 'Supabase', desc: 'Base de datos y autenticación' },
  { name: 'Stripe', desc: 'Procesamiento de pagos' },
  { name: 'Vercel', desc: 'Alojamiento e infraestructura' },
  {
    name: 'OpenAI / Vercel AI Gateway',
    desc: 'Generación de análisis mediante IA',
  },
]

export const PRIVACY_RIGHTS = [
  { right: 'Acceso', desc: 'Solicitar una copia de tus datos personales' },
  { right: 'Rectificación', desc: 'Corregir datos incorrectos o incompletos' },
  { right: 'Eliminación', desc: 'El «derecho al olvido» sobre tus datos' },
  { right: 'Portabilidad', desc: 'Recibir tus datos en formato estructurado' },
  { right: 'Oposición', desc: 'Oponerte al procesamiento de tus datos' },
  {
    right: 'Revocación',
    desc: 'Retirar tu consentimiento en cualquier momento',
  },
]

export const PRIVACY_SECURITY_ITEMS = [
  'Cifrado en tránsito (HTTPS/TLS).',
  'Almacenamiento cifrado en bases de datos.',
  'Control de acceso basado en roles (RLS en Supabase).',
  'Monitoreo de seguridad continuo.',
]

export const PRIVACY_USAGE_ITEMS = [
  'Proporcionar, mantener y mejorar la Plataforma.',
  'Procesar transacciones y gestionar suscripciones.',
  'Personalizar tu experiencia y mostrar contenido relevante.',
  'Comunicarte sobre actualizaciones, soporte y seguridad.',
  'Detectar y prevenir actividades fraudulentas o abusivas.',
  'Cumplir con obligaciones legales.',
]
