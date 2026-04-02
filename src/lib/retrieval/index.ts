// ─────────────────────────────────────────────
// Retrieval — barrel exports (Phase 5 RAG pipeline)
// ─────────────────────────────────────────────

export { retrieveSections } from './retrieve'
export type {
  RetrievalInput,
  RetrievalResult,
  RetrieveApiErrorCode,
  RetrieveErrorResponse,
  RetrieveRequest,
  RetrieveSuccessResponse,
  VideoSectionMatch,
} from './types'
export { RETRIEVE_API_ERROR, RETRIEVE_DEFAULTS } from './types'
