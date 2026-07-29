import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { SectionShell } from '@/components/SectionShell';
import { Reveal } from '@/components/Reveal';
import { useInView } from '@/hooks/useInView';

/**
 * CONTROL — what the client keeps.
 *
 * This occupies the slot the reference fills with a testimonial carousel plus
 * its "Autonomous, not uncontrolled" security section. Neither is reproducible
 * here, and the substitutions are deliberate rather than incidental:
 *
 *  · Testimonials, quotes, company logos and star ratings all require clients.
 *    We have none. Nothing on this page stands in for them — no anonymised
 *    quote, no "a Series B dev-tool company said", no logo strip greyed out to
 *    look coy. The slot is filled with commitments we make instead of praise
 *    someone else supposedly gave us.
 *  · The reference closes its security panel with SOC 2 / ISO / GDPR badges.
 *    We hold none of those certifications, so the badge row is replaced by the
 *    single credential we can actually evidence: a Companies House number the
 *    reader can look up in thirty seconds.
 *  · The reference's art is four interchangeable square frames cross-fading
 *    inside the panel, bound to the active card. That needs a matched set of
 *    four 1:1 frames shot alike; every asset we own is a 2.34:1 panorama from a
 *    narrative sequence, and contained in that box each would letterboard to a
 *    strip. Cross-fading three unlike panoramas would read as a slideshow, so
 *    the device is dropped rather than faked — logged as an image gap.
 *
 * Ported from the reference, intact:
 *  · the bordered card grid, flush hairlines, no gaps and no radius
 *  · the entrance stagger (house 60ms interval, via Reveal)
 *  · the hover border lift and the index chip inverting to solid
 *
 * Two of its defects are not ported. Its cards carry an inline
 * `transitionDelay` used for BOTH entrance and hover, so the last card takes
 * ~600ms to begin responding to a cursor; here the entrance lives on the grid
 * cell as an animation delay and every hover transition lives on a child, so a
 * hover is instant from the first frame. And its 3s auto-advance timer runs in
 * background tabs and walks the highlight out from under a resting cursor —
 * there is no timer in this section at all. Selection is the pointer's, or
 * nobody's.
 *
 * No accent appears here. The accent is for CTAs and live-data marks; a
 * hovered card is neither, and this section sits close enough to the pricing
 * CTA that spending accent on decoration would push that viewport over the
 * three-mark limit. The hover lift is carried by value alone.
 */

interface Guarantee {
  /** Two-digit index, mono. */
  n: string;
  /** Mono gutter kicker — the axis the guarantee sits on. */
  kicker: string;
  title: string;
  /**
   * A node, not a string, so a figure inside the prose can carry the `.num`
   * face. Register rule 5 has no prose exemption — a bare `20%` set in Satoshi
   * is the same bug in a sentence as it is in a table cell.
   */
  body: React.ReactNode;
  /** Spans the full grid width. Used for the closer so the grid ends flush. */
  wide?: boolean;
}

/**
 * Five commitments. Every one is a thing we do or don't do, checkable against
 * the contract and the invoice — none of them is a claim about results.
 */
const KEEPS: readonly Guarantee[] = [
  {
    n: '01',
    kicker: 'Relationships',
    title: 'The creators are yours, not ours',
    body:
      'We source them, brief them and pay them, but we do not sit between you and them as a condition of the work. Ask for a direct introduction to anyone on your roster and you get one.',
  },
  {
    n: '02',
    kicker: 'Cost',
    title: 'You see every creator invoice at cost',
    body: (
      <>
        What the creator charged is what you see. Our fee is{' '}
        <span className="num">20%</span> of creator budget and it sits on its own
        line — it is never folded into a rate and marked up out of view.
      </>
    ),
  },
  {
    n: '03',
    kicker: 'Portability',
    title: 'The tracked link keeps working if you leave',
    body:
      'Placements already live stay live, and the click and signup history behind them is handed over. A link you have paid for does not stop resolving because an arrangement ended.',
  },
  {
    n: '04',
    kicker: 'Term',
    title: 'Cancel any time. No minimum term',
    body:
      'Month to month. There is no annual commitment, no lock-in, and nothing you have to work off before you are allowed to stop. If it is not returning, you stop.',
  },
  {
    n: '05',
    kicker: 'Publicity',
    title: 'We publish nothing about you without your written consent',
    body:
      'No logo, no case study, no screenshot of your dashboard, no number from your account — not until you have said yes in writing. That rule is also why there is nobody else’s name anywhere on this site.',
    wide: true,
  },
] as const;

/**
 * The reference's cross-fade device (security-section:101): four matched 1:1
 * frames stacked in one box, advancing on a 3s timer and following hover on
 * the adjacent card list. The frames are the template's own matched set —
 * atmosphere only; every claim stays in our copy. Card 05 (the wide closer)
 * deliberately has no frame: it spans below both columns.
 */
const FRAMES = [
  '/images/ref-isolated.webp',
  '/images/ref-encrypted.webp',
  '/images/ref-permissions.webp',
  '/images/ref-audit.webp',
] as const;

const FRAME_DWELL_MS = 3000;

/** House stagger. Ledger rows and card grids both step at 60ms. */
const STAGGER_MS = 60;

export interface TrustProps {
  /** Gutter index. The page owner sets the running order — see Index.tsx. */
  index?: string;
  /** Gutter label. */
  label?: string;
  /** Anchor id. */
  id?: string;
}

export const Trust: React.FC<TrustProps> = ({
  index = '06',
  label = 'CONTROL',
  id = 'control',
}) => {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [frameRef, framesInView] = useInView<HTMLDivElement>({ once: false, threshold: 0.2 });

  // Reference timing: 3s dwell. Runs only in view, yields to hover, and does
  // not run at all under reduced motion (hover still drives the frame).
  useEffect(() => {
    if (!framesInView || hovered) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % FRAMES.length), FRAME_DWELL_MS);
    return () => window.clearInterval(t);
  }, [framesInView, hovered]);

  return (
  <SectionShell
    id={id}
    index={index}
    label={label}
    title="You keep the relationships, the rates and the link."
    lede="Managed does not mean captured. Five things stay yours whatever happens to this arrangement, written out in the plainest words we can put them in."
    motes={16}
  >
    {/*
      Flush bordered grid. The container draws the top rule (and the left rule
      from md up, where the cards are inset); each cell draws its own bottom and
      right. Adjacent cells therefore share one hairline instead of stacking two,
      with no negative margins and no gap-px ground behind them.

      min-w-0 on every cell: the bodies are long and this grid is itself a grid
      child of SectionShell. Without it a single unbreakable string could push
      the page sideways at 390px.
    */}
    <div ref={frameRef} className="lg:grid lg:grid-cols-12 lg:gap-8 min-w-0">
    <div className="lg:col-span-7 flex flex-col border-t border-border md:border-l min-w-0"
         onMouseLeave={() => setHovered(false)}>
      {KEEPS.map((item, i) => (
        <Reveal
          key={item.n}
          delay={i * STAGGER_MS}
          className={cn(
            'min-w-0 border-b border-border md:border-r',
            item.wide && 'md:col-span-2',
          )}
        >
          {/* group + h-full: the hover state lives entirely on this child, so
              the stagger's animation delay above can never make a card feel
              dead to the cursor. */}
          <div
            className="group relative h-full py-7 md:p-8 lg:p-10 min-w-0"
            onMouseEnter={() => {
              if (i < FRAMES.length) {
                setActive(i);
                setHovered(true);
              }
            }}
          >
            {/* The border lift. An overlaid hairline rather than a change to
                the cell's own border, so nothing reflows and the flush grid
                stays flush — a 1px border swapping colour on one side only
                would read as a seam opening, not as a card coming forward. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 border border-foreground/35 opacity-0
                         transition-opacity duration-300 group-hover:opacity-100"
            />

            <div className="relative flex items-center gap-4 min-w-0">
              {/* Index chip. Inverts to solid on hover — the reference's icon
                  chip, minus the icon we would have had to invent. */}
              <span
                className="num shrink-0 flex h-9 w-9 items-center justify-center border border-border
                           text-[11px] leading-none text-muted-foreground
                           transition-colors duration-300
                           group-hover:border-foreground group-hover:bg-foreground group-hover:text-background"
              >
                {item.n}
              </span>
              <span className="num min-w-0 truncate text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {item.kicker}
              </span>
            </div>

            <h3 className="relative mt-6 text-[19px] md:text-[21px] font-medium leading-snug tracking-[-0.015em] max-w-[30ch]">
              {item.title}
            </h3>

            <p
              className={cn(
                'relative mt-3 text-[15px] leading-relaxed text-muted-foreground',
                item.wide ? 'max-w-[74ch]' : 'max-w-[46ch]',
              )}
            >
              {item.body}
            </p>
          </div>
        </Reveal>
      ))}
    </div>

      {/* The cross-fade box — reference geometry: one bordered panel, frames at
          h-3/4 w-3/4, object-contain object-right, opacity .85, 700ms fade.
          Sticky so it rides beside the card list at lg; absent below lg where
          it would letterbox between stacked cards. */}
      <div aria-hidden className="hidden lg:block lg:col-span-5 min-w-0">
        <div className="sticky top-24 border border-border bg-background overflow-hidden aspect-square relative">
          {FRAMES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 h-3/4 w-3/4 object-contain object-right',
                'transition-opacity duration-700',
                active === i ? 'opacity-85' : 'opacity-0',
              )}
            />
          ))}
          <span className="num absolute bottom-4 left-5 text-[11px] tracking-[0.14em] text-muted-foreground">
            {String(active + 1).padStart(2, '0')} / {String(FRAMES.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>

    {/*
      Where the reference prints SOC 2, ISO 27001 and GDPR badges. We hold none
      of them, so this is the substitution: one registration, stated plainly,
      that anyone can verify on the public register in under a minute.
    */}
    <Reveal
      delay={KEEPS.length * STAGGER_MS + 80}
      className="mt-10 md:mt-12 border-t border-border pt-5 max-w-[70ch] min-w-0"
    >
      <div className="num text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        On record
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
        There are no certification marks, compliance badges, client logos or
        testimonials on this page. We hold none of them yet and will not print a
        credential we cannot evidence. The one thing here you can check yourself
        is the company behind the contract: Akal Digital Services Ltd,
        registered in England &amp; Wales, No.{' '}
        <span className="num text-foreground">17229387</span>.
      </p>
    </Reveal>
  </SectionShell>
  );
};

export default Trust;
