'use client'

/**
 * BrainNodesViz
 *
 * Neural-network SVG — 3-layer feed-forward architecture + active output node.
 * Size: 180×100px (was 80×50px — enlarged for visual impact).
 *
 * Layers:
 *   L1 (x≈12): 3 input nodes — static
 *   L2 (x≈68): 3 hidden nodes — static
 *   L3 (x≈130): 2 integration nodes — scale-in animated (brain-node-appear)
 *   Output (x=168): 1 pulsing output node (brain-node-appear → brain-pulse loop)
 *
 * Edges:
 *   L1→L2, L2→L3: thin static lines (low-opacity)
 *   L3→Output: traveling-signal via stroke-dasharray + brain-signal keyframe
 *
 * Respects prefers-reduced-motion.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

interface NodeDef {
  id: string
  cx: number
  cy: number
  r: number
}

interface EdgeDef {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
}

// ── Layout ────────────────────────────────────────────────────────────────────

const L1: NodeDef[] = [
  { id: 'n0', cx: 12, cy: 20, r: 5 },
  { id: 'n1', cx: 12, cy: 50, r: 5.5 },
  { id: 'n2', cx: 12, cy: 80, r: 5 },
]

const L2: NodeDef[] = [
  { id: 'n3', cx: 68, cy: 15, r: 5 },
  { id: 'n4', cx: 68, cy: 50, r: 6 },
  { id: 'n5', cx: 68, cy: 85, r: 5 },
]

const L3: NodeDef[] = [
  { id: 'n6', cx: 130, cy: 30, r: 5.5 },
  { id: 'n7', cx: 130, cy: 70, r: 5.5 },
]

const OUTPUT: NodeDef = { id: 'n8', cx: 168, cy: 50, r: 7.5 }

const APPEAR_NODES: (NodeDef & { delay: number })[] = [
  { ...L3[0], delay: 0 },
  { ...L3[1], delay: 120 },
]

const PULSE_NODE = { ...OUTPUT, appearDelay: 250 }

// Build edges between two node sets
function buildEdges(from: NodeDef[], to: NodeDef[]): EdgeDef[] {
  return from.flatMap((f) =>
    to.map((t) => ({
      id: `${f.id}_${t.id}`,
      x1: f.cx,
      y1: f.cy,
      x2: t.cx,
      y2: t.cy,
    })),
  )
}

const STATIC_EDGES: EdgeDef[] = [...buildEdges(L1, L2), ...buildEdges(L2, L3)]

const ACTIVE_EDGES: EdgeDef[] = buildEdges(L3, [OUTPUT])

// ── Component ─────────────────────────────────────────────────────────────────

export function BrainNodesViz() {
  return (
    <svg
      width="180"
      height="100"
      viewBox="0 0 180 100"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Static edges — thin, low-opacity connectors */}
      {STATIC_EDGES.map((e) => (
        <line
          key={e.id}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          stroke="currentColor"
          strokeWidth="0.8"
          className="text-primary/20"
        />
      ))}

      {/* Active signal edges — traveling dot via stroke-dasharray animation */}
      {ACTIVE_EDGES.map((e) => (
        <line
          key={`sig_${e.id}`}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="5 21"
          className="text-primary/65 motion-reduce:[animation:none]"
          style={{ animation: 'brain-signal 1.8s linear infinite' }}
        />
      ))}

      {/* L1 + L2 static nodes */}
      {[...L1, ...L2].map((n) => (
        <circle
          key={n.id}
          cx={n.cx}
          cy={n.cy}
          r={n.r}
          stroke="currentColor"
          strokeWidth="1"
          className="fill-primary/15 text-primary/45"
        />
      ))}

      {/* L3 nodes — scale-in animated */}
      {APPEAR_NODES.map((n) => (
        <circle
          key={n.id}
          cx={n.cx}
          cy={n.cy}
          r={n.r}
          stroke="currentColor"
          strokeWidth="1.2"
          className="fill-primary/30 text-primary motion-reduce:[animation:none]"
          style={{
            transformOrigin: `${n.cx}px ${n.cy}px`,
            animation: `brain-node-appear 0.5s var(--ease-out-expo) ${n.delay}ms both`,
          }}
        />
      ))}

      {/* Output node — appears then pulses forever */}
      <circle
        cx={PULSE_NODE.cx}
        cy={PULSE_NODE.cy}
        r={PULSE_NODE.r}
        stroke="currentColor"
        strokeWidth="1.8"
        className="fill-primary/50 text-primary motion-reduce:[animation:none]"
        style={{
          transformOrigin: `${PULSE_NODE.cx}px ${PULSE_NODE.cy}px`,
          animation: [
            `brain-node-appear 0.5s var(--ease-out-expo) ${PULSE_NODE.appearDelay}ms both`,
            `brain-pulse 2.2s ease-in-out ${PULSE_NODE.appearDelay + 500}ms infinite`,
          ].join(', '),
        }}
      />
    </svg>
  )
}
