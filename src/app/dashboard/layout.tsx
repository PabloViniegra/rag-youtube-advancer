import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardTopbar } from '@/components/dashboard/topbar'
import { getCurrentUser } from '@/lib/auth/actions'

export const metadata: Metadata = {
  title: 'Dashboard — YouTube Intelligence',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirectTo=/dashboard')
  }

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'Usuario'

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <div className="flex min-h-svh bg-surface-container-low">
      <DashboardSidebar
        displayName={displayName}
        email={user.email ?? ''}
        avatarUrl={avatarUrl}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar displayName={displayName} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8"
        >
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
