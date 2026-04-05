# SEO Pack — Design Spec

**Date:** 2026-04-05  
**Status:** Approved  
**Scope:** Phase 6 of the ingestion pipeline — automatic SEO content generation for indexed videos.

---

## Overview

After a video is indexed, the SEO Pack automatically generates four types of content for content creators:

1. **SEO Package** — three YouTube title variants (A/B/C), an SEO-optimized description (500+ chars), and 15 tags.
2. **Chapter Markers** — ready-to-paste YouTube chapter timestamps, derived from the Intelligence Report's existing timestamps. No LLM call.
3. **Show Notes** — podcast-style episode title, description, mentioned resources, and suggested link anchors.
4. **Thumbnail Brief** — a detailed creative brief (main element, text overlay, emotional tone, composition, color palette) for a designer or AI image tool.

The SEO Pack is surfaced in a new **"SEO Pack" tab** on the video detail page (`/dashboard/videos/[id]`), alongside the existing "Intelligence Report" tab.

---

## Decision Log

| Question | Decision | Rationale |
|---|---|---|
| When is it generated? | Automatic, during ingestion (Phase 6) | Zero friction — everything available when the user lands on the video page |
| Storage | Separate `seo_reports` table (JSONB) | Clean separation from `intelligence_reports`; easier to extend and index independently |
| UI placement | New tab on video detail page | Clean navigation; no scroll depth issue as content grows |
| Chapter Markers | Format existing IR timestamps, no LLM | Timestamps already exist in `intelligence_reports.report.summary.timestamps`; formatting is deterministic |
| LLM call strategy | 3 parallel calls | Same pattern as Intelligence Report; each call is focused, independently retryable |

---

## Pipeline

The SEO Pack is **Phase 6**, added after the Intelligence Report (Phase 5). It uses the same graceful degradation pattern — if it fails, the video is already indexed and the Intelligence Report is already stored. The failure is non-blocking.

```
Phase 1: POST /api/transcript        — extract transcript
Phase 2: POST /api/chunk             — split into segments
Phase 3: POST /api/embed             — generate embeddings
Phase 4: POST /api/store             — persist to Supabase
Phase 5: POST /api/generate-report   — Intelligence Report (3 parallel LLM calls)
Phase 6: POST /api/generate-seo-report  — SEO Pack (3 parallel LLM calls)  ← NEW
```

Phase 6 is skipped if Phase 5 fails, since the chapter markers formatter depends on the Intelligence Report being stored. The SEO Package and Show Notes could technically run independently of Phase 5, but skipping Phase 6 on Phase 5 failure keeps the pipeline simple and avoids a partial SEO report without chapter markers.

---

## Data Model

### New table: `seo_reports`

```sql
create table seo_reports (
  id            uuid default gen_random_uuid() primary key,
  video_id      uuid references videos(id) on delete cascade unique,
  report        jsonb not null,
  generated_at  timestamp with time zone not null
);

alter table seo_reports enable row level security;

create policy "Users can read own seo reports"
  on seo_reports for select
  using (
    video_id in (select id from videos where user_id = auth.uid())
    or (select role from profiles where id = auth.uid()) = 'admin'
  );

create policy "Users can insert own seo reports"
  on seo_reports for insert
  with check (
    video_id in (select id from videos where user_id = auth.uid())
  );

create policy "Users can update own seo reports"
  on seo_reports for update
  using (
    video_id in (select id from videos where user_id = auth.uid())
  );
```

**Chapter Markers are not stored.** They are derived at display time from `intelligence_reports.report.summary.timestamps` using a pure formatter function. No extra DB column or table needed.

---

## TypeScript Types

File: `src/lib/seo/types.ts`

```typescript
// ── Call 1: SEO Package ──────────────────────────────────────────────────────

export interface SeoTitleVariant {
  variant: 'A' | 'B' | 'C'
  title: string       // max 100 chars
  rationale: string   // 1 sentence explaining the SEO angle
}

export interface SeoPackage {
  titleVariants: [SeoTitleVariant, SeoTitleVariant, SeoTitleVariant]
  description: string // 500+ chars; first 2 lines must hook without truncation
  tags: [
    string, string, string, string, string,
    string, string, string, string, string,
    string, string, string, string, string
  ] // exactly 15 tags
}

// ── Call 2: Show Notes ───────────────────────────────────────────────────────

export interface ShowNotes {
  episodeTitle: string   // podcast-style title, max 80 chars
  description: string    // 300-500 chars, hooks before the listener clicks
  resources: string[]    // tools, books, people, concepts mentioned in the video
  suggestedLinks: string[] // anchor text suggestions (descriptive labels, not real URLs)
}

// ── Call 3: Thumbnail Brief ──────────────────────────────────────────────────

export interface ThumbnailBrief {
  mainElement: string       // primary visual subject (person, object, scene)
  textOverlay: string       // 3-5 word hook for thumbnail text
  emotionalTone: string     // mood: curiosity / urgency / trust / excitement / etc.
  composition: string       // layout description for designer or AI image tool
  colorSuggestions: string[] // 3-4 descriptive color names (e.g. "deep navy", "warm orange")
}

// ── Combined Report ──────────────────────────────────────────────────────────

export interface SeoReport {
  seoPackage:     SeoPackage
  showNotes:      ShowNotes
  thumbnailBrief: ThumbnailBrief
  generatedAt:    string // ISO 8601
}

// ── Config ───────────────────────────────────────────────────────────────────

export interface SeoConfig {
  model: string
  maxOutputTokens: number
}

export const SEO_CONFIG = {
  model: 'openai/gpt-4o-mini',
  maxOutputTokens: 2048,
} as const satisfies SeoConfig
```

---

## Lib Structure

```
src/lib/seo/
├── types.ts            — SeoReport, SeoPackage, ShowNotes, ThumbnailBrief, SEO_CONFIG
├── prompts.ts          — PROMPT_SEO_PACKAGE, PROMPT_SHOW_NOTES, PROMPT_THUMBNAIL_BRIEF
├── generate.ts         — generateSeoReport() — 3 parallel LLM calls via Vercel AI Gateway
├── chapter-markers.ts  — formatChapterMarkers(timestamps) — pure formatter, no LLM
└── index.ts            — re-exports
```

### `generate.ts` signature

```typescript
export interface GenerateSeoReportInput {
  transcript: string
  title?: string
}

export async function generateSeoReport(
  input: GenerateSeoReportInput,
): Promise<SeoReport>
```

Mirrors `src/lib/intelligence/generate.ts` exactly — 3 `generateText` calls in `Promise.all`, same `parseJsonResponse` helper pattern, same `stripCodeFences` utility.

### `chapter-markers.ts` signature

```typescript
import type { IntelligenceTimestamp } from '@/lib/intelligence/types'

export function formatChapterMarkers(timestamps: IntelligenceTimestamp[]): string
```

Converts `[{ time: "02:15", label: "Tema 1" }, ...]` into:
```
00:00 Introducción
02:15 Tema 1
...
```

Returns an empty string if `timestamps` is empty.

---

## API Route

**`POST /api/generate-seo-report`**

Mirrors `src/app/api/generate-report/route.ts` structurally.

```typescript
// Request body
{ videoId: string; transcript: string; title?: string }

// Success 200
{ reportId: string; report: SeoReport }

// Error responses
// 400 — missing/invalid fields
// 401 — unauthenticated
// 500 — LLM or storage failure
```

Internally:
1. Auth check via `supabase.auth.getUser()`
2. Validate request body
3. Call `generateSeoReport({ transcript, title })`
4. Upsert to `seo_reports` with `onConflict: 'video_id'`
5. Return `{ reportId, report }`

---

## Pipeline Changes (`src/lib/pipeline/`)

### `types.ts`

```typescript
// No new error code needed — Phase 6 is always graceful and never surfaces an error to the caller.
// INGEST_ERROR remains unchanged.
export const INGEST_ERROR = { ...existing } as const

// Extend phase range
export interface IngestProgress {
  phase: 1 | 2 | 3 | 4 | 5 | 6
  label: string
}

// Add seoReport to success shape
export interface IngestSuccess {
  ok: true
  videoId: string
  sectionCount: number
  report: IntelligenceReport | null
  seoReport: SeoReport | null  // ← new
}
```

### `ingest.ts`

Add Phase 6 block after Phase 5, identical structure:

```typescript
// ── Phase 6 — SEO Report (graceful: only runs if Phase 5 succeeded) ──────
let seoReport: IngestSuccess['seoReport'] = null

if (report !== null) {
  try {
    const sr = await fetchJson('/api/generate-seo-report', {
      videoId,
      transcript: fullText,
      title,
    })
    if (sr.status === 200 && isSeoReportOk(sr.data)) {
      seoReport = (sr.data as { report?: unknown }).report as SeoReport ?? null
    }
  } catch {
    // Phase 6 failure is graceful — video and Intelligence Report are already stored.
  }
}

return { ok: true, videoId, sectionCount, report, seoReport }
```

Add `isSeoReportOk` type guard (same shape as `isReportOk`).

---

## Frontend — PhaseProgress Component

The existing `PhaseProgress` component displays phases 1–5. Update it to support phase 6 with the label `"Generando SEO Pack..."`.

---

## UI Components

### Video detail page (`src/app/dashboard/videos/[id]/page.tsx`)

Add `seo_reports` to the parallel Supabase fetch alongside `video_sections` and `intelligence_reports`. Pass both `reportData` and `seoReportData` to a new `VideoReportTabs` component.

### New component tree

```
src/app/dashboard/videos/[id]/_components/
├── video-detail-header.tsx       — no changes
├── video-sections-list.tsx       — no changes
├── video-report-tabs.tsx         — NEW: Client Component, manages active tab state
└── seo-report/
    ├── index.tsx                 — NEW: SeoReportView — receives SeoReport + IR timestamps
    ├── seo-package-card.tsx      — NEW: title variants A/B/C, description, 15 tags
    ├── chapter-markers-card.tsx  — NEW: calls formatChapterMarkers, renders copy block
    ├── show-notes-card.tsx       — NEW: episode title, description, resources
    └── thumbnail-brief-card.tsx  — NEW: main element, text overlay, tone, composition, colors
```

### `VideoReportTabs` (Client Component)

- Two tabs: "Intelligence Report" | "SEO Pack"
- Tabs only render if the corresponding data is non-null. If both are null, the tab bar is hidden.
- If only one report exists, the tab bar is hidden and the single report renders as a plain section — matching the current page behavior before this feature existed.
- Active tab state is local (`useState`) — no URL param needed.

### Copy buttons

Every card exposes a "Copiar" button using the `navigator.clipboard.writeText` API. No external dependency needed.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Phase 6 LLM call fails | Graceful — video and Intelligence Report remain available. SEO tab is hidden. |
| Partial SEO report (one LLM call fails) | `generateSeoReport` throws, the whole Phase 6 is skipped. No partial reports stored. |
| `seo_reports` upsert fails | 500 returned from route, Phase 6 caught gracefully in pipeline. |
| Intelligence Report missing at display time | Chapter Markers card is hidden (no timestamps to format). |

---

## Files Affected

| File | Change |
|---|---|
| Supabase migration | Create `seo_reports` table with RLS |
| `src/lib/seo/types.ts` | New |
| `src/lib/seo/prompts.ts` | New |
| `src/lib/seo/generate.ts` | New |
| `src/lib/seo/chapter-markers.ts` | New |
| `src/lib/seo/index.ts` | New |
| `src/app/api/generate-seo-report/route.ts` | New |
| `src/lib/pipeline/types.ts` | Extend `IngestProgress.phase` to `1–6`, add `seoReport` to `IngestSuccess` |
| `src/lib/pipeline/ingest.ts` | Add Phase 6 block + `isSeoReportOk` type guard |
| `src/app/dashboard/videos/new/_components/phase-progress.tsx` | Add phase 6 label `"Generando SEO Pack..."` |
| `src/app/dashboard/videos/[id]/page.tsx` | Add `seo_reports` fetch, pass to `VideoReportTabs` |
| `src/app/dashboard/videos/[id]/_components/video-report-tabs.tsx` | New |
| `src/app/dashboard/videos/[id]/_components/seo-report/index.tsx` | New |
| `src/app/dashboard/videos/[id]/_components/seo-report/seo-package-card.tsx` | New |
| `src/app/dashboard/videos/[id]/_components/seo-report/chapter-markers-card.tsx` | New |
| `src/app/dashboard/videos/[id]/_components/seo-report/show-notes-card.tsx` | New |
| `src/app/dashboard/videos/[id]/_components/seo-report/thumbnail-brief-card.tsx` | New |
