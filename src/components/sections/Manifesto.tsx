import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { SectionShell } from '@/components/SectionShell';
import { useReducedMotion } from '@/hooks/useInView';

/** The three checks. Operational, not aspirational — each gloss says what we do. */
const WORDS = [
  {
    n: '01',
    word: 'VETTED',
    gloss: 'median recent views, not subscriber counts',
  },
  {
    n: '02',
    word: 'PRICED',
    gloss: 'one negotiated rate, agreed before anything is booked',
  },
  {
    n: '03',
    word: 'ATTRIBUTED',
    gloss: 'a tracked link per placement · clicks and signups by creator',
  },
] as const;

/** Oversized Satoshi word + its mono gloss. Shared by the stage and the fallback. */
const Word: React.FC<{
  n: string;
  word: string;
  gloss: string;
  /** Accent the index — the one live mark on screen. Stage only, never the fallback. */
  marked?: boolean;
  /** Drop the word back to muted while another word holds the stage. */
  dim?: boolean;
  className?: string;
}> = ({ n, word, gloss, marked = false, dim = false, className }) => (
  <div className={cn('min-w-0', className)}>
    <div className="num text-[11px] uppercase tracking-[0.14em]">
      <span className={marked ? 'text-accent' : 'text-muted-foreground'}>{n}</span>
      <span className="text-muted-foreground"> / 03</span>
    </div>
    <div
      className={cn(
        'mt-4 font-black uppercase leading-[0.92] tracking-[-0.03em] break-words',
        'text-[clamp(2.5rem,10.5vw,8rem)]',
        dim ? 'text-muted-foreground' : 'text-foreground',
      )}
    >
      {word}
    </div>
    <div className="mt-5 border-t border-border max-w-[34rem]" />
    <p className="mt-3 font-mono text-[12.5px] md:text-sm leading-relaxed text-muted-foreground max-w-[34rem]">
      {gloss}
    </p>
  </div>
);

export interface ManifestoProps {
  /** Gutter index. Owner of the page order sets this. Default '02'. */
  index?: string;
  /** Gutter label. Default 'STANDARD'. */
  label?: string;
  /** Anchor id. */
  id?: string;
}

/**
 * The kinetic manifesto.
 *
 * Three hard words — VETTED, PRICED, ATTRIBUTED — snap on screen one at a
 * time as you scroll. A pinned stage sits over a travel track of three
 * sentinels; a single IntersectionObserver watches a 1px band at the viewport
 * midline and reports which sentinel is crossing it. No scroll-scrub, no
 * canvas, no rAF loop tied to scroll position.
 *
 * Under `prefers-reduced-motion: reduce` the stage is not built at all: the
 * three words render as a plain stacked list, all visible, nothing pinned.
 */
export const Manifesto: React.FC<ManifestoProps> = ({
  index = '02',
  label = 'STANDARD',
  id = 'standard',
}) => {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const sentinels = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (reduced) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    // A zero-height band across the viewport midline. Exactly one sentinel can
    // cross it, so exactly one word is ever active.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = Number((entry.target as HTMLElement).dataset.wordIndex);
          if (!Number.isNaN(i)) setActive(i);
        });
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );

    sentinels.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <SectionShell
      id={id}
      index={index}
      label={label}
      title="Every placement clears the same three checks."
    >
      {reduced ? (
        /* Reduced motion: the whole manifesto, static. */
        <div className="min-w-0">
          {WORDS.map((w, i) => (
            <Word
              key={w.word}
              {...w}
              className={cn(i > 0 && 'mt-14 pt-14 border-t border-border')}
            />
          ))}
        </div>
      ) : (
        <div className="relative grid min-w-0">
          {/* Travel track. Defines the scroll length; each sentinel is one dwell. */}
          <div className="col-start-1 row-start-1 min-w-0" aria-hidden="true">
            {WORDS.map((w, i) => (
              <div
                key={w.word}
                data-word-index={i}
                ref={(el) => {
                  sentinels.current[i] = el;
                }}
                className="h-[66vh]"
              />
            ))}
          </div>

          {/* Stage. Pins for the length of the track, releases at its end.
              56vh tall at top-[22vh] keeps the word on the viewport midline
              and keeps the void after the release to one section pad. */}
          <div className="col-start-1 row-start-1 min-w-0">
            <div className="sticky top-[22vh] h-[56vh] flex flex-col justify-center min-w-0">
              <div className="relative w-full min-w-0 min-h-[13rem]">
                {WORDS.map((w, i) => (
                  <Word
                    key={w.word}
                    {...w}
                    marked={i === active}
                    dim={i !== active}
                    className={cn(
                      'absolute inset-x-0 top-0 transition-[opacity,transform] duration-500 ease-out',
                      i === active
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-3 pointer-events-none',
                    )}
                  />
                ))}
              </div>

              {/* Progress rail — which of the three you are on. Hairlines only. */}
              <div aria-hidden="true" className="mt-8 flex gap-2">
                {WORDS.map((w, i) => (
                  <span
                    key={w.word}
                    className={cn(
                      'block h-px w-10 transition-colors duration-300',
                      i === active ? 'bg-foreground' : 'bg-border',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </SectionShell>
  );
};

export default Manifesto;
