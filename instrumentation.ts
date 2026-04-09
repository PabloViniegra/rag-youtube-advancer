import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init: initServer } = await import('./sentry.server.config')
    initServer()
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const { init: initEdge } = await import('./sentry.edge.config')
    initEdge()
  }
}

export async function onRequestError(err: Error) {
  Sentry.captureException(err)
}
