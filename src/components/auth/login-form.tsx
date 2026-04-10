'use client'

import { useTransition } from 'react'

import { GitHubIcon, GoogleIcon } from '@/components/dashboard/icons'
import { signInWithGithub, signInWithGoogle } from '@/lib/auth/actions'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  redirectTo?: string
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [isPendingGoogle, startGoogle] = useTransition()
  const [isPendingGithub, startGithub] = useTransition()

  const isAnyPending = isPendingGoogle || isPendingGithub

  function handleGoogle() {
    startGoogle(async () => {
      await signInWithGoogle(redirectTo)
    })
  }

  function handleGithub() {
    startGithub(async () => {
      await signInWithGithub(redirectTo)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={isAnyPending}
        className={cn(
          'flex h-12 w-full items-center gap-3 rounded-xl border border-outline-variant bg-surface-bright px-5',
          'font-body text-sm font-semibold text-on-surface shadow-sm',
          'transition-all hover:bg-surface-container hover:border-outline active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        aria-label="Continuar con Google"
      >
        {isPendingGoogle ? (
          <span className="size-[18px] shrink-0 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
        ) : (
          <GoogleIcon />
        )}
        <span>Continuar con Google</span>
      </button>

      {/* GitHub */}
      <button
        type="button"
        onClick={handleGithub}
        disabled={isAnyPending}
        className={cn(
          'flex h-12 w-full items-center gap-3 rounded-xl bg-on-surface px-5',
          'font-body text-sm font-semibold text-surface-bright',
          'transition-all hover:opacity-90 active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-surface/40',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        aria-label="Continuar con GitHub"
      >
        {isPendingGithub ? (
          <span className="size-[18px] shrink-0 animate-spin rounded-full border-2 border-surface-bright/30 border-t-surface-bright" />
        ) : (
          <GitHubIcon />
        )}
        <span>Continuar con GitHub</span>
      </button>
    </div>
  )
}
