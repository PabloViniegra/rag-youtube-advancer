import { describe, expect, it } from 'vitest'
import type { IntelligenceTimestamp } from '@/lib/intelligence/types'
import { formatChapterMarkers } from './chapter-markers'

describe('formatChapterMarkers', () => {
  it('returns an empty string for an empty array', () => {
    expect(formatChapterMarkers([])).toBe('')
  })

  it('formats a single timestamp correctly', () => {
    const input: IntelligenceTimestamp[] = [
      { time: '0:00', label: 'Introducción' },
    ]
    expect(formatChapterMarkers(input)).toBe('0:00 Introducción')
  })

  it('joins multiple timestamps with newlines', () => {
    const input: IntelligenceTimestamp[] = [
      { time: '0:00', label: 'Intro' },
      { time: '1:30', label: 'Tema principal' },
      { time: '5:45', label: 'Conclusión' },
    ]
    expect(formatChapterMarkers(input)).toBe(
      '0:00 Intro\n1:30 Tema principal\n5:45 Conclusión',
    )
  })

  it('preserves time and label exactly as provided', () => {
    const input: IntelligenceTimestamp[] = [
      { time: '1:02:33', label: 'Q&A con el público — parte final' },
    ]
    expect(formatChapterMarkers(input)).toBe(
      '1:02:33 Q&A con el público — parte final',
    )
  })
})
