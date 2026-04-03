import { ViewTransition } from 'react'

export default function AjustesLoading() {
  return (
    <ViewTransition exit="slide-down" default="none">
      <div
        role="status"
        aria-label="Cargando ajustes…"
        className="flex flex-col gap-8 max-w-2xl"
      >
        {/* Page header skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-7 w-32 rounded-lg bg-surface-container-high animate-pulse" />
          <div className="h-4 w-64 rounded-lg bg-surface-container-high animate-pulse" />
        </div>

        {/* Mi cuenta skeleton */}
        <div className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-background p-6 shadow-sm">
          <div className="h-5 w-28 rounded-lg bg-surface-container-high animate-pulse" />
          <div className="flex flex-col gap-3">
            <div className="h-12 w-full rounded-xl bg-surface-container-low animate-pulse" />
            <div className="h-12 w-full rounded-xl bg-surface-container-low animate-pulse" />
          </div>
        </div>

        {/* Plan y facturación skeleton */}
        <div className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-background p-6 shadow-sm">
          <div className="h-5 w-40 rounded-lg bg-surface-container-high animate-pulse" />
          <div className="h-12 w-full rounded-xl bg-surface-container-low animate-pulse" />
          <div className="flex flex-col gap-4 rounded-xl border border-dashed border-outline-variant px-5 py-5">
            <div className="h-5 w-52 rounded-full bg-surface-container-high animate-pulse" />
            <div className="h-16 w-full rounded-lg bg-surface-container-low animate-pulse" />
            <div className="h-11 w-full rounded-xl bg-surface-container-high animate-pulse opacity-40" />
          </div>
        </div>
      </div>
    </ViewTransition>
  )
}
