/**
 * YouTube URL parsing utilities.
 *
 * Supports all common YouTube URL formats:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *   - https://www.youtube.com/shorts/VIDEO_ID
 *   - https://www.youtube.com/v/VIDEO_ID  (legacy)
 *   - https://m.youtube.com/watch?v=VIDEO_ID  (mobile)
 */

/** YouTube video IDs are always exactly 11 characters: [A-Za-z0-9_-]. */
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

const YOUTUBE_HOSTNAMES = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
])

const PATH_SEGMENT_ROUTES = new Set(['embed', 'shorts', 'v', 'e'])

/**
 * Returns `true` if `id` is a syntactically valid YouTube video ID.
 */
export function isValidVideoId(id: string): boolean {
  return VIDEO_ID_PATTERN.test(id)
}

/**
 * Extracts the YouTube video ID from a URL string.
 *
 * @returns The 11-character video ID, or `null` when the URL is invalid
 *          or does not contain a recognisable video ID.
 */
export function extractVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null

  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    // Not a valid URL at all
    return null
  }

  const { hostname, pathname, searchParams } = parsed

  // ── youtu.be short links ──────────────────────────────────────────────────
  if (hostname === 'youtu.be') {
    const id = pathname.slice(1).split('/')[0]
    return isValidVideoId(id) ? id : null
  }

  // ── youtube.com variants ──────────────────────────────────────────────────
  if (!YOUTUBE_HOSTNAMES.has(hostname)) return null

  // /watch?v=VIDEO_ID  (most common)
  const v = searchParams.get('v')
  if (v !== null && isValidVideoId(v)) return v

  // /embed/VIDEO_ID, /shorts/VIDEO_ID, /v/VIDEO_ID, /e/VIDEO_ID
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length >= 2) {
    const [route, id] = segments
    if (PATH_SEGMENT_ROUTES.has(route) && isValidVideoId(id)) return id
  }

  return null
}
