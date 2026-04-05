import type { IntelligenceTimestamp } from '@/lib/intelligence/types'

/**
 * Converts an array of IntelligenceTimestamp objects into a ready-to-paste
 * YouTube chapter markers string.
 *
 * Each line is formatted as "${time} ${label}", joined with "\n".
 * Returns an empty string if the array is empty.
 */
export function formatChapterMarkers(
  timestamps: IntelligenceTimestamp[],
): string {
  if (timestamps.length === 0) return ''
  return timestamps.map(({ time, label }) => `${time} ${label}`).join('\n')
}
