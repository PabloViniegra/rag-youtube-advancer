'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect, useRef } from 'react'
import { BugIcon } from './icons'

interface BugReportButtonProps {
  variant?: 'sidebar' | 'drawer'
}

const FEEDBACK_OPTIONS = {
  autoInject: false,
  colorScheme: 'system' as const,
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
}

function resolveFeedback() {
  const feedback = Sentry.getFeedback()
  if (feedback) return feedback

  const client = Sentry.getClient()
  if (!client) return null

  client.addIntegration(Sentry.feedbackIntegration(FEEDBACK_OPTIONS))
  return Sentry.getFeedback() ?? null
}

export function BugReportButton({ variant = 'sidebar' }: BugReportButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const btn = buttonRef.current
    if (!btn) return

    const feedback = resolveFeedback()
    if (!feedback) return

    const unsubscribe = feedback.attachTo(btn)
    return () => unsubscribe?.()
  }, [])

  async function handleClick() {
    const feedback = resolveFeedback()
    if (!feedback) return
    try {
      const form = await feedback.createForm()
      form.appendToDom()
      form.open()
    } catch (err) {
      console.error('[BugReport] createForm error:', err)
    }
  }

  const baseClass =
    'flex w-full items-center gap-3 rounded-lg px-3 font-body text-sm font-semibold transition-all hover:bg-inverse-on-surface/8 hover:text-inverse-on-surface'

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      className={
        variant === 'drawer'
          ? `${baseClass} py-3 text-on-surface-variant/70`
          : `${baseClass} py-2.5 text-on-surface-variant/60`
      }
      title="Reportar un bug"
      aria-label="Reportar un bug"
    >
      <BugIcon />
      <span>Reportar bug</span>
    </button>
  )
}
