/**
 * Loading skeleton for /dashboard (home)
 *
 * Mirrors the layout of dashboard/page.tsx:
 *  - Hero greeting: overline + h1 + subline + CTA buttons
 *  - Stats strip: 4-cell horizontal grid (shown when user has videos)
 *  - Onboarding cards: 3-column grid (shown when user has no videos)
 *
 * We render both the stats strip and the onboard cards stacked — whichever
 * the real page ends up showing, the skeleton height is roughly correct.
 *
 * animate-pulse is suppressed globally for prefers-reduced-motion users
 * via the @media block in globals.css.
 */

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true">
      {/* ── Hero greeting skeleton ── */}
      <div className="flex flex-col gap-4 border-b border-outline-variant pb-8">
        {/* Overline */}
        <div className="h-3 w-32 animate-pulse rounded bg-surface-container" />
        {/* h1 — two lines (name may wrap) */}
        <div className="flex flex-col gap-2">
          <div className="h-10 w-56 animate-pulse rounded-lg bg-surface-container md:w-72" />
        </div>
        {/* Subline */}
        <div className="h-4 w-80 animate-pulse rounded-md bg-surface-container max-w-lg" />
        {/* CTA buttons row */}
        <div className="mt-2 flex flex-wrap gap-3">
          <div className="h-11 w-36 animate-pulse rounded-xl bg-surface-container" />
          <div className="h-11 w-44 animate-pulse rounded-xl bg-surface-container" />
        </div>
      </div>

      {/* ── Stats strip skeleton ── */}
      <div className="grid grid-cols-2 divide-x divide-outline-variant overflow-hidden rounded-xl border border-outline-variant md:grid-cols-4">
        {(['s1', 's2', 's3', 's4'] as const).map((k) => (
          <div key={k} className="flex flex-col gap-1 bg-background px-5 py-4">
            <div className="h-7 w-14 animate-pulse rounded-lg bg-surface-container" />
            <div className="h-3 w-24 animate-pulse rounded bg-surface-container" />
          </div>
        ))}
      </div>

      {/* ── Onboard cards skeleton ── */}
      <div className="grid gap-6 md:grid-cols-3">
        {(['o1', 'o2', 'o3'] as const).map((k) => (
          <div
            key={k}
            className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-background p-6"
          >
            {/* Step number */}
            <div className="h-12 w-10 animate-pulse rounded-lg bg-surface-container" />
            {/* Title */}
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-surface-container" />
            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-full animate-pulse rounded bg-surface-container" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-surface-container" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
