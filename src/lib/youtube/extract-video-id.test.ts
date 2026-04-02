import { describe, expect, it } from 'vitest'
import { extractVideoId, isValidVideoId } from './extract-video-id'

// A real-looking 11-character video ID used across all tests
const VALID_ID = 'dQw4w9WgXcQ'

describe('isValidVideoId', () => {
  it('accepts an 11-char alphanumeric+underscore+hyphen ID', () => {
    expect(isValidVideoId(VALID_ID)).toBe(true)
    expect(isValidVideoId('abc_DEF-123')).toBe(true)
  })

  it('rejects IDs that are too short or too long', () => {
    expect(isValidVideoId('short')).toBe(false)
    expect(isValidVideoId('thisoneis12c')).toBe(false) // 12 chars
  })

  it('rejects IDs with invalid characters', () => {
    expect(isValidVideoId('dQw4w9WgX!Q')).toBe(false)
    expect(isValidVideoId('dQw4w9WgX Q')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidVideoId('')).toBe(false)
  })
})

describe('extractVideoId', () => {
  // ── Standard watch URLs ───────────────────────────────────────────────────
  it('extracts from standard watch URL', () => {
    expect(extractVideoId(`https://www.youtube.com/watch?v=${VALID_ID}`)).toBe(
      VALID_ID,
    )
  })

  it('extracts from watch URL with extra query params', () => {
    expect(
      extractVideoId(
        `https://www.youtube.com/watch?v=${VALID_ID}&t=42s&list=PL123`,
      ),
    ).toBe(VALID_ID)
  })

  it('extracts from mobile watch URL', () => {
    expect(extractVideoId(`https://m.youtube.com/watch?v=${VALID_ID}`)).toBe(
      VALID_ID,
    )
  })

  // ── Short links ───────────────────────────────────────────────────────────
  it('extracts from youtu.be short URL', () => {
    expect(extractVideoId(`https://youtu.be/${VALID_ID}`)).toBe(VALID_ID)
  })

  it('extracts from youtu.be URL with query params', () => {
    expect(extractVideoId(`https://youtu.be/${VALID_ID}?t=30`)).toBe(VALID_ID)
  })

  // ── Embed & Shorts ────────────────────────────────────────────────────────
  it('extracts from embed URL', () => {
    expect(extractVideoId(`https://www.youtube.com/embed/${VALID_ID}`)).toBe(
      VALID_ID,
    )
  })

  it('extracts from shorts URL', () => {
    expect(extractVideoId(`https://www.youtube.com/shorts/${VALID_ID}`)).toBe(
      VALID_ID,
    )
  })

  it('extracts from legacy /v/ URL', () => {
    expect(extractVideoId(`https://www.youtube.com/v/${VALID_ID}`)).toBe(
      VALID_ID,
    )
  })

  // ── Invalid inputs ────────────────────────────────────────────────────────
  it('returns null for a non-YouTube URL', () => {
    expect(extractVideoId('https://vimeo.com/123456789')).toBeNull()
  })

  it('returns null for a completely invalid string', () => {
    expect(extractVideoId('not-a-url')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(extractVideoId('')).toBeNull()
  })

  it('returns null for a YouTube URL with no video ID', () => {
    expect(extractVideoId('https://www.youtube.com/')).toBeNull()
    expect(extractVideoId('https://www.youtube.com/watch')).toBeNull()
  })

  it('returns null when the v param contains an invalid ID', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=short')).toBeNull()
  })

  it('trims leading/trailing whitespace from the URL', () => {
    expect(extractVideoId(`  https://youtu.be/${VALID_ID}  `)).toBe(VALID_ID)
  })
})
