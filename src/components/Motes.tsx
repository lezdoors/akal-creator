import React, { useMemo } from 'react';
import { useReducedMotion } from '@/hooks/useInView';

/**
 * Motes — the slow drifting points of light behind a dark panel.
 *
 * This is the "flying light insects" effect. It is what makes a black panel
 * feel inhabited rather than empty, and it costs nothing: no canvas, no rAF
 * loop, no library. Pure CSS transforms on a handful of absolutely positioned
 * dots, so it composites on the GPU and never touches the main thread.
 *
 * Deterministic by design — positions come from a seeded PRNG rather than
 * Math.random, so a mote never jumps to a new spot on re-render, and two
 * panels with the same seed are identical between reloads.
 *
 * Renders nothing under prefers-reduced-motion. Drifting specks are exactly
 * the sort of ambient movement that triggers vestibular discomfort, and
 * nothing is lost by omitting them.
 */

export interface MotesProps {
  /** How many points. 18–28 reads as atmosphere; more reads as static. */
  count?: number;
  /** Change to get a different arrangement at the same density. */
  seed?: number;
  className?: string;
}

/** mulberry32 — small, fast, and stable across renders. */
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

export const Motes: React.FC<MotesProps> = ({ count = 22, seed = 7, className = '' }) => {
  const reduced = useReducedMotion();

  const motes = useMemo(() => {
    const rand = rng(seed);
    return Array.from({ length: count }, (_, i) => {
      const size = 1.5 + rand() * 3.5;
      return {
        id: i,
        left: `${rand() * 100}%`,
        top: `${rand() * 100}%`,
        size,
        // Bigger motes read as nearer, so they drift further and sit brighter.
        opacity: 0.12 + (size / 5) * 0.3,
        duration: `${16 + rand() * 22}s`,
        delay: `${-rand() * 30}s`, // negative: mid-drift on arrival, never a synchronised start
        drift: `${(rand() - 0.5) * 60}px`,
        rise: `${-30 - rand() * 50}px`,
      };
    });
  }, [count, seed]);

  if (reduced) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {motes.map((m) => (
        <span
          key={m.id}
          className="mote"
          style={{
            left: m.left,
            top: m.top,
            width: `${m.size}px`,
            height: `${m.size}px`,
            opacity: m.opacity,
            animationDuration: m.duration,
            animationDelay: m.delay,
            ['--drift' as string]: m.drift,
            ['--rise' as string]: m.rise,
          }}
        />
      ))}
    </div>
  );
};
