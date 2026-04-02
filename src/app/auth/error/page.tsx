import Link from 'next/link'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

interface AuthErrorPageProps {
  searchParams: SearchParams
}

const ERROR_MESSAGES: Record<string, string> = {
  oauth_callback_failed:
    'The sign-in could not be completed. Please try again.',
  access_denied: 'You cancelled the sign-in process.',
  default: 'An unexpected authentication error occurred.',
}

export default async function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps) {
  const params = await searchParams
  const reason = typeof params?.reason === 'string' ? params.reason : 'default'
  const message = ERROR_MESSAGES[reason] ?? ERROR_MESSAGES['default']

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Authentication error
        </h1>
        <p className="text-sm text-gray-500">{message}</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  )
}
