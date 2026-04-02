import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges conditional classes', () => {
    expect(cn('px-2', true && 'py-1', false && 'hidden')).toBe('px-2 py-1')
  })

  it('resolves tailwind conflicts by keeping last value', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})
