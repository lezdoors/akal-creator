import { useEffect, useRef, useState } from 'react';

/**
 * True when the user has asked for reduced motion.
 * SSR-safe: returns false when there is no window.
 */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Reactive version of the above. Re-renders if the OS setting flips mid-session.
 * Starts `false` on the server so markup is identical either way.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(prefersReducedMotion);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

export interface UseInViewOptions {
  /** Fraction of the element that must be visible. Default 0.15. */
  threshold?: number | number[];
  /** Shrinks/grows the observation box, e.g. '-20% 0px'. Default '0px 0px -10% 0px'. */
  rootMargin?: string;
  /** Stop observing after the first entry. Default true — reveals never replay. */
  once?: boolean;
  /** Set false to hold the element hidden (e.g. behind a feature flag). Default true. */
  enabled?: boolean;
}

/**
 * IntersectionObserver in a hook.
 *
 *   const [ref, inView] = useInView<HTMLDivElement>();
 *   <div ref={ref} className={inView ? 'animate-appear' : 'opacity-0'} />
 *
 * With `once` (the default) the observer disconnects on first intersection, so
 * `inView` latches true and never fires again. Without it, `inView` tracks the
 * element continuously.
 *
 * SSR / unsupported browsers: `inView` resolves to true so content is never
 * stranded invisible.
 */
export function useInView<T extends Element = HTMLDivElement>(
  options: UseInViewOptions = {},
): [React.RefObject<T>, boolean] {
  const {
    threshold = 0.15,
    rootMargin = '0px 0px -10% 0px',
    once = true,
    enabled = true,
  } = options;

  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  // Latch so a `once` observer can never be re-armed by an options change.
  const seen = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    // SSR and ancient browsers: show everything rather than hide it.
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    if (once && seen.current) {
      setInView(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          seen.current = true;
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
    // threshold may be an array literal; serialise so it is a stable dep.
  }, [enabled, once, rootMargin, JSON.stringify(threshold)]);

  return [ref, inView];
}
