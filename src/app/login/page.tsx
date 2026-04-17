import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Acceder — Second Brain',
  description: 'Inicia sesión para acceder a tu segundo cerebro para YouTube.',
  // Login page should not be indexed — it has no SEO value and may confuse
  // search engines with session-dependent content.
  robots: { index: false, follow: false },
}

interface LoginPageProps {
  searchParams: Promise<{ redirectTo?: string }>
}

// ── Dynamic: reads searchParams at request time ───────────────────────────────

async function LoginFormSection({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams
  return <LoginForm redirectTo={redirectTo} />
}

// ── Page shell (static) ───────────────────────────────────────────────────────

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="flex min-h-svh">
      {/* ── LEFT PANEL — Editorial Crimson brand panel ── */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 md:flex">
        {/* Ambient amber blob */}
        <div
          className="pointer-events-none absolute -bottom-32 -right-24 size-[480px] rounded-full bg-secondary opacity-20 blur-3xl"
          aria-hidden="true"
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-on-primary/10 ring-1 ring-on-primary/20 backdrop-blur-sm">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m10 8 6 4-6 4V8Z"
                fill="white"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-headline text-sm font-extrabold uppercase tracking-widest text-on-primary/80">
            Second Brain
          </span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 flex flex-col gap-6">
          <p className="font-headline text-4xl font-extrabold leading-tight text-on-primary">
            Tu segundo cerebro para YouTube
          </p>
          <p className="font-body text-base leading-relaxed text-on-primary/65">
            Convierte cualquier video en conocimiento accionable. Busca, resume
            y extrae insights con IA en segundos.
          </p>

          {/* Feature bullets */}
          <ul className="flex flex-col gap-3">
            {[
              'Búsqueda semántica en todos tus videos',
              'Ganchos y resúmenes generados por IA',
              'Contexto RAG para respuestas precisas',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  className="mt-1.5 size-2 shrink-0 rounded-full bg-secondary"
                  aria-hidden="true"
                />
                <span className="font-body text-sm text-on-primary/75">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Social proof */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2" aria-hidden="true">
            {['A', 'M', 'C'].map((initial) => (
              <div
                key={initial}
                className="flex size-8 items-center justify-center rounded-full bg-on-primary/15 ring-2 ring-primary font-headline text-xs font-bold text-on-primary/80"
              >
                {initial}
              </div>
            ))}
          </div>
          <p className="font-body text-sm text-on-primary/55">
            <span className="font-semibold text-on-primary/75">847</span>{' '}
            creadores ya dentro
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 md:w-1/2 md:px-12 lg:px-20">
        <div className="w-full max-w-sm">
          {/* Mobile-only brand strip */}
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="text-primary"
              >
                <path
                  d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="m10 8 6 4-6 4V8Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-headline text-sm font-extrabold uppercase tracking-widest text-on-surface">
              Second Brain
            </span>
          </div>

          {/* Back link */}
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-1.5 rounded py-2 font-body text-sm text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M19 12H5m0 0 7 7m-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Volver al inicio
          </Link>

          {/* Heading */}
          <div className="mb-8 flex flex-col gap-2">
            <h1 className="font-headline text-2xl font-extrabold text-on-surface">
              Accede a tu cuenta
            </h1>
            <p className="font-body text-sm text-on-surface-variant">
              Elige tu proveedor para continuar
            </p>
          </div>

          {/* OAuth buttons — dynamic: reads redirectTo from searchParams */}
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginFormSection searchParams={searchParams} />
          </Suspense>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div
              className="h-px flex-1 bg-outline-variant"
              aria-hidden="true"
            />
            <span className="font-body text-xs text-on-surface-variant">
              Sin contraseña necesaria
            </span>
            <div
              className="h-px flex-1 bg-outline-variant"
              aria-hidden="true"
            />
          </div>

          {/* Terms */}
          <p className="text-center font-body text-xs leading-relaxed text-on-surface-variant">
            Al continuar, aceptas nuestros{' '}
            <Link
              href="/legal/terminos"
              className="rounded px-0.5 py-1 text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
            >
              Términos de Servicio
            </Link>{' '}
            y la{' '}
            <Link
              href="/legal/privacidad"
              className="rounded px-0.5 py-1 text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
            >
              Política de Privacidad
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-11 w-full animate-pulse rounded-xl bg-surface-container-low" />
      <div className="h-11 w-full animate-pulse rounded-xl bg-surface-container-low" />
    </div>
  )
}
