/**
 * QuickPromptsSkeleton
 *
 * Renders pill-shaped skeletons while AI-generated quick prompts load.
 * Matches the approximate width/height of the question chip pills.
 */

export function QuickPromptsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-body text-xs text-on-surface-variant">
        Ideas para empezar:
      </p>
      <div className="flex flex-wrap gap-2">
        {[120, 160, 140, 150].map((width) => (
          <div
            key={width}
            style={{ width }}
            className="h-7 animate-pulse rounded-full bg-surface-container-low"
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}
