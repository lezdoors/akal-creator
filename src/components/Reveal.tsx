import React from 'react';
import { cn } from '@/lib/utils';
import { useInView, useReducedMotion } from '@/hooks/useInView';

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Element tag to render. Default 'div'. Use 'li', 'tr', 'h2', … as needed. */
  as?: React.ElementType;
  /** Stagger in milliseconds before this element animates. Default 0. */
  delay?: number;
  /** Visible fraction that triggers the reveal. Default 0.15. */
  threshold?: number | number[];
  /** Observation box offset. Default nudges the trigger to just above the fold. */
  rootMargin?: string;
  /** Replay every time it re-enters. Default false — reveals fire once. */
  repeat?: boolean;
  /** Swap the rise for a 0.98→1 scale (the `.animate-appear-zoom` keyframe). */
  zoom?: boolean;
  children?: React.ReactNode;
}

/**
 * Scroll reveal. Wraps children, holds them at opacity 0, then applies the
 * house `.animate-appear` (opacity + 10px rise, 500ms ease-out) once the
 * element enters the viewport.
 *
 *   <Reveal delay={120} as="li">…</Reveal>
 *
 * Under `prefers-reduced-motion: reduce` it renders plainly visible with no
 * animation class and no transform at all.
 */
export const Reveal: React.FC<RevealProps> = ({
  as: Tag = 'div',
  delay = 0,
  threshold = 0.15,
  rootMargin,
  repeat = false,
  zoom = false,
  className,
  style,
  children,
  ...rest
}) => {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLElement>({
    threshold,
    once: !repeat,
    ...(rootMargin ? { rootMargin } : {}),
  });

  const Component = Tag as React.ElementType;

  // Reduced motion: visible immediately, untouched.
  if (reduced) {
    return (
      <Component ref={ref} className={className} style={style} {...rest}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      ref={ref}
      className={cn(
        'opacity-0',
        inView && (zoom ? 'animate-appear-zoom' : 'animate-appear'),
        className,
      )}
      style={delay ? { ...style, animationDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Reveal;
