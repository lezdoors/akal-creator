import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { SectionShell } from '@/components/SectionShell';
import { Motes } from '@/components/Motes';
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
  /** Inside the panel the word shares its row with the art column, so it is
   *  sized to the copy cell rather than to the full content width. */
  panelled?: boolean;
  className?: string;
}> = ({ n, word, gloss, marked = false, dim = false, panelled = false, className }) => (
  <div className={cn('min-w-0', className)}>
    <div className="num text-[11px] uppercase tracking-[0.14em]">
      <span className={marked ? 'text-accent' : 'text-muted-foreground'}>{n}</span>
      <span className="text-muted-foreground"> / 03</span>
    </div>
    <div
      className={cn(
        'mt-4 font-black uppercase leading-[0.92] tracking-[-0.03em] break-words',
        // ATTRIBUTED is ten characters of Satoshi Black. Both caps are set so it
        // clears its cell on one line at every width — a mid-word break here
        // would read as a rendering fault.
        panelled
          ? 'text-[clamp(2.25rem,9vw,5rem)] lg:text-[clamp(2.5rem,4.6vw,4.25rem)]'
          : 'text-[clamp(2.5rem,10.5vw,8rem)]',
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

/**
 * The art column — full height, full opacity, hard outer edge.
 *
 * This is the reference's Features composition and the point of it is what it
 * is NOT: the frame is not a dimmed wash laid behind the type. It holds its own
 * 42% cell at opacity 1; only the inner edge dissolves into the copy, so the
 * top, right and bottom meet the panel border hard. Same asset either way — the
 * difference between art direction and a watermark is entirely the composition.
 *
 * Dropped below lg rather than stacked: a letterboxed strip of macro
 * photography above the words on a phone adds nothing and costs 120KB.
 */
const ArtColumn: React.FC = () => (
  <div className="hidden lg:block relative w-[42%] shrink-0 overflow-hidden border-l border-border">
    <img
      src="/images/field.webp"
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      /* The frame is a 2.34:1 panorama going into a portrait cell, so it is
         cropped, not contained — contained would letterbox it to a strip with
         dead black above and below.
         object-right, and the crop was chosen by looking at both ends: the
         source's LEFT third is two sharp amber heads under a warm bokeh mass,
         which fights the word for the eye and sits off the magenta palette. The
         RIGHT third is the pink field receding into black — no competing focal
         point, and it says "a population" rather than "a specimen", which is
         what a section about a standard applied to every placement wants. */
      className="absolute inset-0 h-full w-full object-cover object-right"
    />

    {/* Inner edge only — and only the inner edge. The middle stop is
        transparent, matching FeaturePanel and the reference; a `background/25`
        midpoint (which shipped here) veils the whole frame rather than
        feathering its join, and a veiled frame reads as a watermark. */}
    <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />

    {/* The reference's hero lays a hairline lattice over its art; it is the one
        device on that section worth taking — pure CSS, no asset, and it puts
        the black plate on the same ruled grammar as the rest of the document.
        Effective alpha is 0.20 × 0.16, i.e. barely there, which is the point. */}
    <div aria-hidden className="absolute inset-0 opacity-[0.16]">
      {[20, 40, 60, 80].map((t) => (
        <span key={`h${t}`} className="absolute inset-x-0 h-px bg-foreground/20" style={{ top: `${t}%` }} />
      ))}
      {[25, 50, 75].map((l) => (
        <span key={`v${l}`} className="absolute inset-y-0 w-px bg-foreground/20" style={{ left: `${l}%` }} />
      ))}
    </div>
  </div>
);

export interface ManifestoProps {
  /** Gutter index. Owner of the page order sets this — see Index.tsx. */
  index?: string;
  /** Gutter label. */
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
 *
 * ART — where we deliberately depart from the reference:
 *
 * 1. The section no longer passes `image` to SectionShell. That prop renders a
 *    radially-masked frame at reduced strength behind the copy, which at this
 *    size reads as a watermark. The frame now holds a real column inside a
 *    bordered panel (see ArtColumn) and the section ground is left clean.
 *
 * 2. The reference's Security section cross-fades four interchangeable frames
 *    against an active list index — mechanically that maps onto our word
 *    machine exactly, and we are not doing it. We own five frames and they are
 *    a narrative set (dispersal → arrival), not four parallel objects. VETTED
 *    and ATTRIBUTED have honest frames; PRICED — a negotiated rate — has no
 *    image in the library and no image that could be commissioned cheaply.
 *    Rotating a loosely-related frame under it would be decoration pretending
 *    to be meaning, which is the same failure mode as filling a stat slot with
 *    a plausible number. So one frame is held for the whole run, and what moves
 *    against the words is structure: the floor rule below. Logged as an image
 *    gap — three matched square frames, one per check, would earn the
 *    cross-fade.
 *
 * 3. The reference marks its active step with a bar under one card. Ours runs
 *    the full panel width, across the copy AND the art, so the two columns read
 *    as one instrument rather than a copy block that happens to sit beside a
 *    picture. It is a translate, not a width animation — compositor only.
 */
export const Manifesto: React.FC<ManifestoProps> = ({
  index = '05',
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
      /* No section-level motes. The section is now 2.5 viewports of mostly
         empty ground with one panel in it, and specks drifting across that
         ground read as dust on the screen rather than atmosphere. They belong
         inside the panel, which is where FeaturePanel puts them. */
      motes={0}
    >
      {reduced ? (
        /* Reduced motion: the whole manifesto, static. Unchanged — and it gets
           no art column. The art is decorative and the copy has to read with it
           absent; a 42% cell stretched down a 2,000px stacked list would crop a
           panorama four times over and read as a smear. */
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
            {/* Tail. The observer's band is the viewport MIDLINE, so the last
                sentinel keeps crossing it for 50vh after the sticky element has
                run out of container and released. Without this the third word —
                ATTRIBUTED, which is the whole pitch — got 16vh of pinned dwell
                against 66vh for the other two, then rode up the screen while
                still active. 50vh of extra track hands the release point back
                to exactly where the third word's dwell ends. */}
            <div className="h-[50vh]" />
          </div>

          {/* Stage. Full-viewport sticky at top-0 so it unpins EXACTLY when the
              track ends. A shorter sticky (e.g. h-56vh at top-22vh) releases
              early and the remaining track scrolls past as dead paper — that
              bug left ~1200px of empty ground before the next section.

              Nothing between here and the section root may take overflow-hidden
              or the pin dies silently. The panel below carries it, but the panel
              is a descendant of the sticky element, not an ancestor of it. */}
          <div className="col-start-1 row-start-1 min-w-0">
            <div className="sticky top-0 h-screen flex flex-col justify-center min-w-0">
              {/* The panel is bounded rather than full-height: a 42% art cell
                  stretched over 100vh is a 4× crop of a panorama and the frame
                  stops being legible. 32rem tracks the reference's 500px. */}
              <div
                className={cn(
                  'relative flex min-w-0 overflow-hidden border border-border bg-background',
                  'min-h-[16rem] sm:min-h-[20rem] lg:h-[min(32rem,72vh)]',
                )}
              >
                {/* Copy cell */}
                <div className="relative flex-1 min-w-0 flex flex-col justify-center p-5 sm:p-8 lg:p-12">
                  <Motes count={12} seed={Number(index) * 13 + 5} />
                  {/* The three words share one grid cell rather than being
                      absolutely stacked over a min-height. Same visual result,
                      but the box now measures itself to the tallest of the
                      three at whatever width it is handed — no magic number to
                      go stale when a gloss rewraps, and no way for a gloss to
                      escape the panel padding. They stay TOP-aligned, so the
                      index and the cap height hold still while the words swap;
                      centring each one would make the label hop. */}
                  <div className="relative grid w-full min-w-0">
                    {WORDS.map((w, i) => (
                      <Word
                        key={w.word}
                        {...w}
                        panelled
                        marked={i === active}
                        dim={i !== active}
                        className={cn(
                          'col-start-1 row-start-1 self-start transition-[opacity,transform] duration-500 ease-out',
                          i === active
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-3 pointer-events-none',
                        )}
                      />
                    ))}
                  </div>
                </div>

                <ArtColumn />

                {/* Floor rule — which of the three you are on. One hairline
                    across the whole panel, a third of it lit, translated by
                    index. Transform only, so it never reflows the panel. */}
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-border">
                  <div
                    className="h-px w-1/3 bg-accent transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(${active * 100}%)` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SectionShell>
  );
};

export default Manifesto;
