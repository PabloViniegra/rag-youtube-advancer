import type { ReactNode } from 'react'

// ─── LegalSection ──────────────────────────────────────────────────────────
interface LegalSectionProps {
  id: string
  num: string
  title: string
  children: ReactNode
}

export function LegalSection({ id, num, title, children }: LegalSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 pt-10 first:pt-0 border-t border-outline-variant first:border-t-0"
    >
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-xs font-mono font-bold text-primary/40 shrink-0 tabular-nums select-none pt-0.5">
          {num}
        </span>
        <h2 className="text-xl md:text-2xl font-headline font-bold text-on-surface leading-tight">
          {title}
        </h2>
      </div>
      <div className="pl-8 space-y-5 text-on-surface-variant font-body text-[15px] leading-relaxed">
        {children}
      </div>
    </section>
  )
}

// ─── LegalSubsection ───────────────────────────────────────────────────────
export function LegalSubsection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="border-l-2 border-outline-variant pl-5 space-y-3">
      <h3 className="text-sm font-headline font-semibold text-on-surface">
        {title}
      </h3>
      {children}
    </div>
  )
}

// ─── LegalList ─────────────────────────────────────────────────────────────
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static list with no stable ids
        <li key={i} className="flex items-start gap-3">
          <span
            className="mt-2 shrink-0 size-1.5 rounded-full bg-primary/60"
            aria-hidden="true"
          />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  )
}

// ─── LegalProviderGrid ─────────────────────────────────────────────────────
export function LegalProviderGrid({
  providers,
}: {
  providers: { name: string; desc: string }[]
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
      {providers.map((p) => (
        <div
          key={p.name}
          className="bg-surface-container rounded-xl p-4 border border-outline-variant"
        >
          <p className="text-sm font-headline font-semibold text-on-surface">
            {p.name}
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
            {p.desc}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── LegalRightsGrid ───────────────────────────────────────────────────────
export function LegalRightsGrid({
  rights,
}: {
  rights: { right: string; desc: string }[]
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
      {rights.map((r) => (
        <div
          key={r.right}
          className="bg-primary-container/60 rounded-xl p-4 border border-primary/10"
        >
          <p className="text-sm font-headline font-semibold text-on-primary-container">
            {r.right}
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
            {r.desc}
          </p>
        </div>
      ))}
    </div>
  )
}
