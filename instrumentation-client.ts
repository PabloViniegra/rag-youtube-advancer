import * as Sentry from '@sentry/nextjs'

export function init() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    sendDefaultPii: true,
    tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
    enableLogs: true,
    debug: true,
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
