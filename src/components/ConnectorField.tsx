import React, { useMemo } from 'react';
import { useInView, useReducedMotion } from '@/hooks/useInView';

/**
 * ConnectorField — a lattice of nodes with lines that draw themselves on,
 * hold, then fade. Ported from the reference's region panel.
 *
 * The mechanism is `stroke-dasharray` set to a length longer than any line,
 * with `stroke-dashoffset` animating to zero: the stroke appears to be drawn
 * rather than faded in. One keyframe serves lines of any length because the
 * dasharray is uniform.
 *
 * Deterministic: node jitter and line pairing come from a seeded PRNG, so the
 * field is identical between renders and reloads. Math.random would reshuffle
 * the whole lattice on every re-render.
 *
 * Only animates once in view. Flattens to a static dim lattice under
 * prefers-reduced-motion.
 */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ConnectorFieldProps {
  cols?: number;
  rows?: number;
  /** How many drawn lines cross the field. */
  lines?: number;
  seed?: number;
  className?: string;
}

export const ConnectorField: React.FC<ConnectorFieldProps> = ({
  cols = 5,
  rows = 4,
  lines = 6,
  seed = 3,
  className = '',
}) => {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2 });

  const { nodes, segments } = useMemo(() => {
    const rand = rng(seed);
    const pts: { x: number; y: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        pts.push({
          // Slight jitter so it reads as a network, not graph paper.
          x: (c / (cols - 1)) * 100 + (rand() - 0.5) * 2,
          y: (r / (rows - 1)) * 100 + (rand() - 0.5) * 3,
        });
      }
    }
    const segs = Array.from({ length: lines }, (_, i) => {
      const a = pts[Math.floor(rand() * pts.length)];
      const b = pts[Math.floor(rand() * pts.length)];
      return { a, b, delay: i * 0.55 + rand() * 0.4 };
    }).filter((s) => s.a !== s.b);
    return { nodes: pts, segments: segs };
  }, [cols, rows, lines, seed]);

  return (
    <div ref={ref} aria-hidden className={`absolute inset-0 ${className}`}>
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        // vectorEffect on the children keeps strokes hairline despite the
        // non-uniform scale this viewBox applies.
      >
        {segments.map((s, i) => (
          <line
            key={i}
            x1={s.a.x}
            y1={s.a.y}
            x2={s.b.x}
            y2={s.b.y}
            vectorEffect="non-scaling-stroke"
            className={inView && !reduced ? 'connector-line' : undefined}
            style={
              inView && !reduced
                ? { animationDelay: `${s.delay}s` }
                : { stroke: 'hsl(var(--accent))', opacity: 0.18, strokeWidth: 1 }
            }
          />
        ))}
        {nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={0.5}
            vectorEffect="non-scaling-stroke"
            fill="hsl(var(--accent))"
            opacity={0.55}
          />
        ))}
      </svg>
    </div>
  );
};
