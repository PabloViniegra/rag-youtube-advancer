import type { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/actions'

export const metadata: Metadata = {
  title: 'Inicio — Dashboard',
}

// ── Mock stats ───────────────────────────────────────────────────────────────

const STATS = [
  {
    label: 'Videos indexados',
    value: '0',
    icon: VideoIcon,
    hint: 'Añade tu primer video',
  },
  {
    label: 'Secciones en memoria',
    value: '0',
    icon: BrainIcon,
    hint: 'Segmentos vectorizados',
  },
  {
    label: 'Búsquedas realizadas',
    value: '0',
    icon: SearchIcon,
    hint: 'Consultas RAG totales',
  },
  {
    label: 'Plan actual',
    value: 'Free',
    icon: PlanIcon,
    hint: 'Actualiza a Pro por $5/mes',
  },
] as const

export default async function DashboardPage() {
  const user = await getCurrentUser()

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0] ??
    'Usuario'

  return (
    <div className="flex flex-col gap-8">
      {/* ── Greeting ── */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">
          Bienvenido, {displayName}
        </h1>
        <p className="font-body text-sm text-on-surface-variant">
          Tu segundo cerebro para YouTube está listo. Empieza añadiendo un
          video.
        </p>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-3 rounded-2xl border border-outline-variant bg-background p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-body text-xs font-medium text-on-surface-variant">
                {stat.label}
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                <stat.icon />
              </div>
            </div>
            <p className="font-headline text-3xl font-extrabold text-on-surface">
              {stat.value}
            </p>
            <p className="font-body text-xs text-on-surface-variant">
              {stat.hint}
            </p>
          </div>
        ))}
      </div>

      {/* ── Empty state — no videos yet ── */}
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-outline-variant bg-background px-6 py-16 text-center">
        {/* Illustration placeholder */}
        <div className="flex size-20 items-center justify-center rounded-2xl bg-primary-container">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-on-primary-container"
            aria-hidden="true"
          >
            <path
              d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42C1 8.14 1 11.72 1 11.72s0 3.58.46 5.3a2.78 2.78 0 0 0 1.95 1.95C5.12 19.44 12 19.44 12 19.44s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95C23 15.3 23 11.72 23 11.72s0-3.58-.46-5.3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m9.75 15.02 5.75-3.3-5.75-3.3v6.6Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-headline text-xl font-bold text-on-surface">
            Aún no tienes videos indexados
          </h2>
          <p className="max-w-sm font-body text-sm leading-relaxed text-on-surface-variant">
            Pega la URL de cualquier video de YouTube y lo convertiremos en
            conocimiento consultable mediante IA.
          </p>
        </div>

        <Link
          href="/dashboard/videos/nuevo"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 font-body text-sm font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-dim active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          Añadir primer video
        </Link>
      </div>

      {/* ── Quick actions ── */}
      <div className="flex flex-col gap-4">
        <h2 className="font-headline text-base font-bold text-on-surface">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QuickAction
            href="/dashboard/videos/nuevo"
            title="Indexar video"
            description="Añade una URL de YouTube a tu cerebro"
            icon={PlusIcon}
          />
          <QuickAction
            href="/dashboard/buscar"
            title="Buscar en tu cerebro"
            description="Consulta tus videos con lenguaje natural"
            icon={SearchIcon}
          />
          <QuickAction
            href="/dashboard/ajustes"
            title="Actualizar a Pro"
            description="Desbloquea búsquedas ilimitadas por $5/mes"
            icon={SparkleIcon}
            accent
          />
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface QuickActionProps {
  href: string
  title: string
  description: string
  icon: () => React.ReactNode
  accent?: boolean
}

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
  accent,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        accent
          ? 'border-secondary/30 bg-secondary-container hover:border-secondary/50'
          : 'border-outline-variant bg-background hover:border-outline'
      }`}
    >
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
          accent
            ? 'bg-secondary text-on-secondary'
            : 'bg-surface-container text-on-surface-variant group-hover:bg-primary-container group-hover:text-on-primary-container'
        }`}
      >
        <Icon />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-body text-sm font-semibold text-on-surface">
          {title}
        </span>
        <span className="font-body text-xs leading-relaxed text-on-surface-variant">
          {description}
        </span>
      </div>
    </Link>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function VideoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m22.54 6.42-2.1-2.1A2 2 0 0 0 19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 1.44-.58l2.1-2.1A2 2 0 0 0 23 16V8a2 2 0 0 0-.46-1.58Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m10 9 5 3-5 3V9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BrainIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.67-3.98 3 3 0 0 1 .34-5.58 2.5 2.5 0 0 1 4.79-1.48M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.67-3.98 3 3 0 0 0-.34-5.58A2.5 2.5 0 0 0 14.5 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path
        d="m21 21-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PlanIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3v1m0 16v1M4.22 4.22l.7.7m14.14 14.14.7.7M3 12h1m16 0h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
