'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpNumberProps {
  readonly value: number
  readonly suffix?: string
  readonly prefix?: string
  readonly decimals?: number
  readonly duration?: number
  readonly className?: string
}

/** Counts from 0 to `value` when the element enters the viewport. */
export function CountUpNumber({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 1400,
  className,
}: CountUpNumberProps) {
  const [current, setCurrent] = useState(0)
  const spanRef = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = spanRef.current
    if (!el) return

    // Graceful degradation — just show the final value if API unavailable
    if (typeof IntersectionObserver === 'undefined') {
      setCurrent(value)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasAnimated.current) return
        hasAnimated.current = true

        const startTime = performance.now()

        const tick = (now: number) => {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          // ease-out-quart: 1 - (1 - t)^4
          const eased = 1 - (1 - progress) ** 4
          setCurrent(eased * value)
          if (progress < 1) requestAnimationFrame(tick)
        }

        requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration])

  const display = current.toFixed(decimals)

  return (
    <span ref={spanRef} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
