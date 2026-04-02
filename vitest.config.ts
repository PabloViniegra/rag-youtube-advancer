import path from 'node:path'
import { defineConfig } from 'vitest/config'

const COVERAGE_INCLUDES = [
  'src/lib/ai/chunk.ts',
  'src/lib/ai/embed.ts',
  'src/lib/env.ts',
  'src/lib/utils.ts',
  'src/lib/auth/actions.ts',
  'src/lib/youtube/extract-video-id.ts',
  'src/lib/youtube/transcript.ts',
  // Phase 4 — Storage
  'src/lib/storage/store.ts',
  'src/app/api/store/route.ts',
] as const

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    server: {
      deps: {
        // youtube-transcript has a packaging issue: package.json has "type":"module"
        // but its "main" field points to a CJS file. Inlining forces Vite to
        // transform it via its own pipeline, resolving the ESM/CJS conflict.
        inline: ['youtube-transcript'],
      },
    },
    coverage: {
      provider: 'v8',
      include: [...COVERAGE_INCLUDES],
      reporter: ['text', 'json-summary', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
})
