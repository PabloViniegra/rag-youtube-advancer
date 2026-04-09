import Link from 'next/link'

/**
 * App-level 404 boundary.
 * Rendered by Next.js whenever `notFound()` is called or a route is not matched.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8 text-center">
      <div className="flex flex-col items-center gap-6">
        <p className="font-label text-5xl font-bold text-primary">404</p>

        <div className="flex flex-col gap-2">
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Página no encontrada
          </h1>
          <p className="font-body text-sm text-on-surface-variant max-w-sm">
            La página que buscas no existe o fue movida.
          </p>
        </div>

        <Link
          href="/"
          className="rounded-xl bg-primary px-5 py-2.5 font-body text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
