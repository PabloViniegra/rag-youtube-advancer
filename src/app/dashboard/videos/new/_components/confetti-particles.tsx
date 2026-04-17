'use client'

/**
 * ConfettiParticles
 *
 * Renders 20 absolutely-positioned confetti pieces with 3 shapes (circle, square, triangle)
 * that drift in 3 directional variants (left, center, right) using keyframe animations.
 * Positions, shapes, colors, and animation variants are pre-computed (no Math.random())
 * so SSR output is stable. Hidden entirely when `show` is false or prefers-reduced-motion.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

type Shape = 'circle' | 'square' | 'triangle'
type DriftVariant = 'left' | 'center' | 'right'

interface ParticleDef {
  id: string
  left: string
  top: string
  size: string
  colorClass: string
  delay: string
  duration: string
  shape: Shape
  drift: DriftVariant
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Pre-computed values — no runtime randomness. 20 particles with 3 shapes, 3 drift variants
const PARTICLES: ParticleDef[] = [
  // Row 1 — drift-left variant
  {
    id: 'p0',
    left: '8%',
    top: '5%',
    size: '8px',
    colorClass: 'bg-primary',
    delay: '0ms',
    duration: '900ms',
    shape: 'circle',
    drift: 'left',
  },
  {
    id: 'p1',
    left: '22%',
    top: '2%',
    size: '6px',
    colorClass: 'bg-tertiary',
    delay: '80ms',
    duration: '1100ms',
    shape: 'square',
    drift: 'left',
  },
  {
    id: 'p2',
    left: '35%',
    top: '8%',
    size: '7px',
    colorClass: 'bg-secondary',
    delay: '160ms',
    duration: '950ms',
    shape: 'triangle',
    drift: 'left',
  },
  {
    id: 'p3',
    left: '48%',
    top: '3%',
    size: '7px',
    colorClass: 'bg-primary',
    delay: '40ms',
    duration: '1050ms',
    shape: 'circle',
    drift: 'left',
  },
  {
    id: 'p4',
    left: '62%',
    top: '6%',
    size: '9px',
    colorClass: 'bg-tertiary',
    delay: '200ms',
    duration: '880ms',
    shape: 'square',
    drift: 'left',
  },
  {
    id: 'p5',
    left: '75%',
    top: '1%',
    size: '6px',
    colorClass: 'bg-secondary',
    delay: '120ms',
    duration: '1020ms',
    shape: 'triangle',
    drift: 'left',
  },

  // Row 2 — drift-center variant
  {
    id: 'p6',
    left: '12%',
    top: '12%',
    size: '8px',
    colorClass: 'bg-primary/70',
    delay: '240ms',
    duration: '970ms',
    shape: 'circle',
    drift: 'center',
  },
  {
    id: 'p7',
    left: '40%',
    top: '15%',
    size: '7px',
    colorClass: 'bg-tertiary/80',
    delay: '300ms',
    duration: '1080ms',
    shape: 'square',
    drift: 'center',
  },
  {
    id: 'p8',
    left: '78%',
    top: '9%',
    size: '9px',
    colorClass: 'bg-primary',
    delay: '60ms',
    duration: '920ms',
    shape: 'triangle',
    drift: 'center',
  },
  {
    id: 'p9',
    left: '55%',
    top: '0%',
    size: '6px',
    colorClass: 'bg-secondary/80',
    delay: '180ms',
    duration: '1000ms',
    shape: 'circle',
    drift: 'center',
  },

  // Row 3 — drift-right variant
  {
    id: 'p10',
    left: '18%',
    top: '4%',
    size: '7px',
    colorClass: 'bg-primary/60',
    delay: '100ms',
    duration: '950ms',
    shape: 'square',
    drift: 'right',
  },
  {
    id: 'p11',
    left: '32%',
    top: '11%',
    size: '8px',
    colorClass: 'bg-tertiary/70',
    delay: '220ms',
    duration: '1030ms',
    shape: 'triangle',
    drift: 'right',
  },
  {
    id: 'p12',
    left: '65%',
    top: '7%',
    size: '6px',
    colorClass: 'bg-secondary',
    delay: '140ms',
    duration: '890ms',
    shape: 'circle',
    drift: 'right',
  },
  {
    id: 'p13',
    left: '85%',
    top: '3%',
    size: '9px',
    colorClass: 'bg-primary',
    delay: '260ms',
    duration: '1050ms',
    shape: 'square',
    drift: 'right',
  },

  // Row 4 — mixed drift variants
  {
    id: 'p14',
    left: '25%',
    top: '1%',
    size: '8px',
    colorClass: 'bg-tertiary/60',
    delay: '50ms',
    duration: '980ms',
    shape: 'triangle',
    drift: 'center',
  },
  {
    id: 'p15',
    left: '42%',
    top: '6%',
    size: '7px',
    colorClass: 'bg-secondary/70',
    delay: '190ms',
    duration: '1010ms',
    shape: 'circle',
    drift: 'left',
  },
  {
    id: 'p16',
    left: '70%',
    top: '13%',
    size: '6px',
    colorClass: 'bg-primary',
    delay: '130ms',
    duration: '930ms',
    shape: 'square',
    drift: 'right',
  },
  {
    id: 'p17',
    left: '15%',
    top: '9%',
    size: '7px',
    colorClass: 'bg-secondary',
    delay: '270ms',
    duration: '1060ms',
    shape: 'circle',
    drift: 'center',
  },
  {
    id: 'p18',
    left: '58%',
    top: '2%',
    size: '8px',
    colorClass: 'bg-tertiary',
    delay: '110ms',
    duration: '970ms',
    shape: 'triangle',
    drift: 'left',
  },
  {
    id: 'p19',
    left: '88%',
    top: '5%',
    size: '9px',
    colorClass: 'bg-primary/80',
    delay: '170ms',
    duration: '1040ms',
    shape: 'square',
    drift: 'right',
  },
]

// ── Shape Renderer ────────────────────────────────────────────────────────────

/**
 * Renders a shape using CSS-only techniques:
 * - circle: border-radius 50%
 * - square: rounded corners (rounded-sm)
 * - triangle: uses clip-path-triangle Tailwind utility class from globals.css
 */
function getShapeClasses(shape: Shape): string {
  switch (shape) {
    case 'circle':
      return 'rounded-full'
    case 'square':
      return 'rounded-sm'
    case 'triangle':
      return 'clip-path-triangle'
    default:
      return 'rounded-sm'
  }
}

// ── Animation Class Mapper ────────────────────────────────────────────────────

function getDriftAnimation(
  variant: DriftVariant,
  duration: string,
  delay: string,
): string {
  const animationName = `confetti-drift-${variant}`
  return `${animationName} ${duration} ease-in ${delay} both`
}

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
          className={`absolute ${p.colorClass} ${getShapeClasses(p.shape)}`}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animation: getDriftAnimation(p.drift, p.duration, p.delay),
          }}
        />
      ))}
    </div>
  )
}
