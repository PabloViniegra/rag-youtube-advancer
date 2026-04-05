import { describe, expect, it } from 'vitest'
import {
  PROMPT_SEO_PACKAGE,
  PROMPT_SHOW_NOTES,
  PROMPT_THUMBNAIL_BRIEF,
} from './prompts'

describe('SEO prompts', () => {
  it('PROMPT_SEO_PACKAGE is a non-empty string', () => {
    expect(typeof PROMPT_SEO_PACKAGE).toBe('string')
    expect(PROMPT_SEO_PACKAGE.length).toBeGreaterThan(0)
  })

  it('PROMPT_SHOW_NOTES is a non-empty string', () => {
    expect(typeof PROMPT_SHOW_NOTES).toBe('string')
    expect(PROMPT_SHOW_NOTES.length).toBeGreaterThan(0)
  })

  it('PROMPT_THUMBNAIL_BRIEF is a non-empty string', () => {
    expect(typeof PROMPT_THUMBNAIL_BRIEF).toBe('string')
    expect(PROMPT_THUMBNAIL_BRIEF.length).toBeGreaterThan(0)
  })

  it('all three prompts are distinct', () => {
    expect(PROMPT_SEO_PACKAGE).not.toBe(PROMPT_SHOW_NOTES)
    expect(PROMPT_SEO_PACKAGE).not.toBe(PROMPT_THUMBNAIL_BRIEF)
    expect(PROMPT_SHOW_NOTES).not.toBe(PROMPT_THUMBNAIL_BRIEF)
  })

  it('each prompt instructs JSON-only output', () => {
    for (const prompt of [
      PROMPT_SEO_PACKAGE,
      PROMPT_SHOW_NOTES,
      PROMPT_THUMBNAIL_BRIEF,
    ]) {
      expect(prompt).toContain('JSON')
    }
  })
})
