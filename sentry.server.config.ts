import * as Sentry from '@sentry/nextjs'

export function init() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
    enableLogs: true,
    debug: true,
  })
}
