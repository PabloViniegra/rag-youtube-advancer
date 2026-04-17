'use client'

import { useEffect, useState } from 'react'

/**
 * useCountUp
 *
 * Animates a count from 0 to a target value using requestAnimationFrame.
 * Respects prefers-reduced-motion media query for accessibility.
 *
 * In JSDOM (test environment), window.matchMedia is unavailable,
 * so the hook immediately returns the target value (no RAF).
 *
 * @param target - The target number to count up to
 * @param duration - Animation duration in milliseconds (default: 800ms)
 * @returns Current count value (0 → target)
 *
 * @example
 * ```tsx
 * const count = useCountUp(42, 800)
 * return <span>{count}</span>  // "0" → "42"
 * ```
 */
export function useCountUp(target: number, duration: number = 800): number {
  const [count, setCount] = useState(target)

  useEffect(() => {
    // Check if we're in a browser environment with matchMedia
    if (typeof window === 'undefined' || !window.matchMedia) {
      // JSDOM or no matchMedia support → return target immediately
      setCount(target)
      return
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      // Accessibility: skip animation, go straight to target
      setCount(target)
      return
    }

    // Start animation from 0
    setCount(0)
    const startTime = Date.now()
    let frameId: number

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const currentValue = Math.floor(progress * target)

      setCount(currentValue)

      if (progress < 1) {
        frameId = requestAnimationFrame(animate)
      }
    }

    frameId = requestAnimationFrame(animate)

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [target, duration])

  return count
}
