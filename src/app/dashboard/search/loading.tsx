export default function SearchLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-2 border-b border-outline-variant pb-6">
        <div className="h-3 w-32 animate-pulse rounded bg-surface-container" />
        <div className="h-9 w-64 animate-pulse rounded bg-surface-container" />
        <div className="h-4 w-80 animate-pulse rounded bg-surface-container" />
      </div>
      {/* Status skeleton */}
      <div className="h-8 w-52 animate-pulse rounded-lg bg-surface-container" />
      {/* Form skeleton */}
      <div className="flex flex-col gap-4">
        <div className="h-12 w-full animate-pulse rounded-xl bg-surface-container" />
        <div className="h-10 w-32 animate-pulse rounded-xl bg-surface-container" />
      </div>
    </div>
  )
}
