'use client'

/**
 * ConfettiParticles
 *
 * Renders 10 absolutely-positioned confetti pieces that fall and fade out
 * using the `confetti-fall` keyframe. Positions and colors are pre-computed
 * (no Math.random() at render time) so SSR output is stable.
 * Hidden entirely when `show` is false or when prefers-reduced-motion is on.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

interface ParticleDef {
  id: string
  left: string
  top: string
  width: string
  height: string
  colorClass: string
  delay: string
  duration: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Pre-computed values — no runtime randomness
const PARTICLES: ParticleDef[] = [
  {
    id: 'p0',
    left: '10%',
    top: '5%',
    width: '8px',
    height: '8px',
    colorClass: 'bg-primary',
    delay: '0ms',
    duration: '900ms',
  },
  {
    id: 'p1',
    left: '22%',
    top: '2%',
    width: '6px',
    height: '10px',
    colorClass: 'bg-tertiary',
    delay: '80ms',
    duration: '1100ms',
  },
  {
    id: 'p2',
    left: '37%',
    top: '8%',
    width: '10px',
    height: '6px',
    colorClass: 'bg-secondary',
    delay: '160ms',
    duration: '950ms',
  },
  {
    id: 'p3',
    left: '52%',
    top: '3%',
    width: '7px',
    height: '9px',
    colorClass: 'bg-primary',
    delay: '40ms',
    duration: '1050ms',
  },
  {
    id: 'p4',
    left: '63%',
    top: '6%',
    width: '9px',
    height: '7px',
    colorClass: 'bg-tertiary',
    delay: '200ms',
    duration: '880ms',
  },
  {
    id: 'p5',
    left: '75%',
    top: '1%',
    width: '6px',
    height: '8px',
    colorClass: 'bg-secondary',
    delay: '120ms',
    duration: '1020ms',
  },
  {
    id: 'p6',
    left: '15%',
    top: '12%',
    width: '8px',
    height: '6px',
    colorClass: 'bg-primary/70',
    delay: '240ms',
    duration: '970ms',
  },
  {
    id: 'p7',
    left: '44%',
    top: '15%',
    width: '7px',
    height: '7px',
    colorClass: 'bg-tertiary/80',
    delay: '300ms',
    duration: '1080ms',
  },
  {
    id: 'p8',
    left: '82%',
    top: '9%',
    width: '9px',
    height: '9px',
    colorClass: 'bg-primary',
    delay: '60ms',
    duration: '920ms',
  },
  {
    id: 'p9',
    left: '58%',
    top: '0%',
    width: '6px',
    height: '10px',
    colorClass: 'bg-secondary/80',
    delay: '180ms',
    duration: '1000ms',
  },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface ConfettiParticlesProps {
  show: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ConfettiParticles({ show }: ConfettiParticlesProps) {
  if (!show) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
    >
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-sm ${p.colorClass}`}
          style={{
            left: p.left,
            top: p.top,
            width: p.width,
            height: p.height,
            animation: `confetti-fall ${p.duration} ease-in ${p.delay} both`,
          }}
        />
      ))}
    </div>
  )
}
