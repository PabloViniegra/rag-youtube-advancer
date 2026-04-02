import { describe, expect, it } from 'vitest'
import { chunkText } from './chunk'

describe('chunkText', () => {
  it('returns an empty array for blank input', () => {
    expect(chunkText('   \n\n  ')).toEqual([])
  })

  it('returns a single chunk when text length is <= chunk size', () => {
    expect(chunkText('short text')).toEqual(['short text'])
  })

  it('splits into overlapping chunks with default config', () => {
    const text = `${'a'.repeat(1000)}${'b'.repeat(1000)}${'c'.repeat(300)}`

    const chunks = chunkText(text)

    expect(chunks).toHaveLength(3)
    expect(chunks[0]).toBe('a'.repeat(1000))
    expect(chunks[1]?.slice(0, 200)).toBe('a'.repeat(200))
    expect(chunks[1]?.slice(200)).toBe('b'.repeat(800))
    expect(chunks[2]).toBe(`${'b'.repeat(400)}${'c'.repeat(300)}`)
  })

  it('supports custom chunk config', () => {
    const chunks = chunkText('abcdefgh', { size: 4, overlap: 1 })
    expect(chunks).toEqual(['abcd', 'defg', 'gh'])
  })
})
