import * as Sentry from '@sentry/nextjs'

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug'

const sentryLevelMap: Record<LogLevel, Sentry.SeverityLevel> = {
  log: 'log',
  warn: 'warning',
  error: 'error',
  info: 'info',
  debug: 'debug',
}

function getMessagePrefix(context: string): string {
  return `[${context}]`
}

export const logger = {
  log(context: string, message: string, ...args: unknown[]) {
    console.log(getMessagePrefix(context), message, ...args)
    Sentry.logger.log(`${getMessagePrefix(context)} ${message}`)
    flushSentry()
  },

  info(context: string, message: string, ...args: unknown[]) {
    console.info(getMessagePrefix(context), message, ...args)
    Sentry.logger.info(`${getMessagePrefix(context)} ${message}`)
    flushSentry()
  },

  warn(context: string, message: string, ...args: unknown[]) {
    console.warn(getMessagePrefix(context), message, ...args)
    Sentry.logger.warn(`${getMessagePrefix(context)} ${message}`)
    flushSentry()
  },

  error(context: string, message: string, error?: unknown, ...args: unknown[]) {
    console.error(getMessagePrefix(context), message, error, ...args)
    if (error instanceof Error) {
      Sentry.captureException(error, {
        extra: { context: getMessagePrefix(context), message, args },
      })
    } else {
      Sentry.logger.error(`${getMessagePrefix(context)} ${message}`)
    }
    flushSentry()
  },

  debug(context: string, message: string, ...args: unknown[]) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(getMessagePrefix(context), message, ...args)
    }
    Sentry.logger.debug(`${getMessagePrefix(context)} ${message}`)
    flushSentry()
  },
}

async function flushSentry() {
  if (process.env.NODE_ENV === 'development') {
    await Sentry.flush(500)
  }
}
