import * as Sentry from '@sentry/nextjs'

// Module-level — Next.js loads this file in the browser automatically.
// Named exports are hooks; init() is NOT a recognized hook, so it must run here.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  enableLogs: true,
  debug: true,
  integrations: [
    Sentry.feedbackIntegration({
      autoInject: false,
      colorScheme: 'system',
      showBranding: false,
      formTitle: 'Reportar un bug',
      submitButtonLabel: 'Enviar reporte',
      cancelButtonLabel: 'Cancelar',
      nameLabel: 'Nombre',
      namePlaceholder: 'Tu nombre',
      emailLabel: 'Email',
      emailPlaceholder: 'tu@email.com',
      messageLabel: 'Descripción',
      messagePlaceholder: 'Describe el bug que encontraste...',
      isRequiredLabel: '(obligatorio)',
      successMessageText: '¡Reporte enviado! Gracias por tu feedback.',
    }),
  ],
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
