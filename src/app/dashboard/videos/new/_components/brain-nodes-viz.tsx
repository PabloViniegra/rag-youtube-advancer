'use client'

/**
 * BrainNodesViz
 *
 * Decorative SVG showing a small neural-network diagram.
 * 4 static nodes + 2 animated nodes that appear with a scale-in effect
 * using the `brain-node-appear` keyframe, staggered by 100ms.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

const STATIC_NODES = [
  { id: 'n0', cx: 10, cy: 25, r: 4 },
  { id: 'n1', cx: 32, cy: 10, r: 5 },
  { id: 'n2', cx: 32, cy: 40, r: 4 },
  { id: 'n3', cx: 60, cy: 25, r: 5 },
] as const satisfies readonly {
  id: string
  cx: number
  cy: number
  r: number
}[]

const ANIMATED_NODES = [
  { id: 'a0', cx: 75, cy: 12, r: 3.5, delay: 0 },
  { id: 'a1', cx: 75, cy: 38, r: 3.5, delay: 100 },
] as const satisfies readonly {
  id: string
  cx: number
  cy: number
  r: number
  delay: number
}[]

const ALL_NODES = [...STATIC_NODES, ...ANIMATED_NODES]

// Edges between node index pairs (by ALL_NODES index)
const EDGES = [
  { id: 'e01', a: 0, b: 1 },
  { id: 'e02', a: 0, b: 2 },
  { id: 'e13', a: 1, b: 3 },
  { id: 'e23', a: 2, b: 3 },
  { id: 'e34', a: 3, b: 4 },
  { id: 'e35', a: 3, b: 5 },
] as const satisfies readonly { id: string; a: number; b: number }[]

// ── Component ─────────────────────────────────────────────────────────────────

export function BrainNodesViz() {
  return (
    <svg
      width="80"
      height="50"
      viewBox="0 0 80 50"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Edges */}
      {EDGES.map((edge) => {
        const from = ALL_NODES[edge.a]
        const to = ALL_NODES[edge.b]
        return (
          <line
            key={edge.id}
            x1={from.cx}
            y1={from.cy}
            x2={to.cx}
            y2={to.cy}
            stroke="currentColor"
            strokeWidth="0.8"
            className="text-primary/30"
          />
        )
      })}

      {/* Static nodes */}
      {STATIC_NODES.map((node) => (
        <circle
          key={node.id}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          className="fill-primary/20 stroke-primary stroke-[1.2]"
        />
      ))}

      {/* Animated nodes */}
      {ANIMATED_NODES.map((node) => (
        <circle
          key={node.id}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          className="fill-primary/40 stroke-primary stroke-[1.5] motion-reduce:animation-none"
          style={{
            transformOrigin: `${node.cx}px ${node.cy}px`,
            animation: `brain-node-appear 0.5s var(--ease-out-expo) ${node.delay}ms both`,
          }}
        />
      ))}
    </svg>
  )
}
