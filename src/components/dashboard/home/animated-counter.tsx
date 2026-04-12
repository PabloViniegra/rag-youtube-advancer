'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  target: number
  duration?: number
  delay?: number
}

export function AnimatedCounter({
  target,
  duration = 1200,
  delay = 0,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reducedMotion) {
      setDisplay(target)
      return
    }

    let startTime: number | null = null
    let delayTimeout: ReturnType<typeof setTimeout> | null = null

    function tick(timestamp: number) {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - (1 - progress) ** 3

      setDisplay(Math.round(eased * target))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    delayTimeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick)
    }, delay)

    return () => {
      if (delayTimeout !== null) clearTimeout(delayTimeout)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, delay])

  return <>{display.toLocaleString('es-ES')}</>
}
