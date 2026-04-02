import path from 'node:path'
import { defineConfig } from 'vitest/config'

const COVERAGE_INCLUDES = [
  'src/lib/ai/chunk.ts',
  'src/lib/ai/embed.ts',
  'src/lib/env.ts',
  'src/lib/utils.ts',
  'src/lib/auth/actions.ts',
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
