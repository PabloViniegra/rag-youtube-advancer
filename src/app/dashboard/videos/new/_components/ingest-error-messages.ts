import { INGEST_ERROR } from '@/lib/pipeline/types'

/**
 * Human-readable error messages for ingest error codes.
 * Kept here to avoid bloating new-video-orchestrator.tsx.
 */

export const INGEST_ERROR_MESSAGES: Record<string, string> = {
  [INGEST_ERROR.INVALID_URL]: 'La URL de YouTube no es válida.',
  [INGEST_ERROR.TRANSCRIPT_FAILED]:
    'No se pudo extraer la transcripción del video.',
  [INGEST_ERROR.CHUNK_FAILED]: 'Error al procesar el texto del video.',
  [INGEST_ERROR.EMBED_FAILED]: 'Error al generar los embeddings.',
  [INGEST_ERROR.STORE_FAILED]: 'Error al guardar el video en la base de datos.',
  [INGEST_ERROR.REPORT_FAILED]: 'Error al generar el informe de inteligencia.',
  [INGEST_ERROR.UNAUTHORIZED]: 'Debes iniciar sesión para añadir videos.',
  [INGEST_ERROR.FORBIDDEN]:
    'Necesitas una suscripción activa para añadir videos.',
  [INGEST_ERROR.VIDEO_LIMIT_REACHED]:
    'Has alcanzado el limite de tu plan gratuito (1 video). Actualiza a Pro para seguir indexando.',
}

/** Generic server-side messages that should be replaced with the localised copy above. */
export const GENERIC_INGEST_MESSAGES = [
  'Transcript extraction failed.',
  'Text chunking failed.',
  'Embedding generation failed.',
  'Storing video sections failed.',
  'Invalid transcript response.',
  'Invalid chunk response.',
  'Invalid embed response.',
  'Invalid store response.',
] as const satisfies readonly string[]

export function resolveIngestErrorMessage(
  code: string,
  rawMessage: string,
): string {
  const normalized = rawMessage.trim()
  if (normalized === '') {
    return (
      INGEST_ERROR_MESSAGES[code] ?? 'Error inesperado. Inténtalo de nuevo.'
    )
  }
  const isGeneric = GENERIC_INGEST_MESSAGES.some((m) => m === normalized)
  return isGeneric ? (INGEST_ERROR_MESSAGES[code] ?? normalized) : normalized
}
