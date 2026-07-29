import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { CharReveal } from '@/components/CharReveal';
import { Motes } from '@/components/Motes';
import { useInView } from '@/hooks/useInView';

export interface FinalCTAProps {
  /**
   * Opens the booking dialog. When omitted the primary CTA degrades to an
   * in-page link to the booking section, so the button is never inert.
   */
  onBookCall?: () => void;
  /**
   * Gutter index. This section builds its own <section> rather than using
   * SectionShell (the panel needs three rows and its own lattice), so the
   * gutter label is assembled here — but the number still comes from Index.tsx
   * like every other section. It used to be the string '08 / START', which is
   * exactly how it went stale when two sections were inserted above it.
   */
  index?: string;
  /** Gutter label. */
  label?: string;
  /** Anchor id. */
  id?: string;
}

const PRIMARY_CLASSES =
  'group inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground ' +
  'text-[11px] uppercase tracking-[0.18em] font-semibold px-8 py-4 ' +
  'hover:bg-foreground hover:text-background transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-secondary';

/* Drafting lattice behind the closing panel. Lifted from the reference hero's
   8×12 white/10 grid, which the image audit called the one device from that
   composition worth taking: pure CSS, no asset, no motion, and it reads as our
   own hairline language rather than as decoration. Thinned to 6×10 because the
   panel covers the middle of the section — all that is ever visible is the
   margin around it, which is exactly the amount of it we want. */
const LATTICE_ROWS = 6;
const LATTICE_COLS = 10;

/**
 * Closing CTA — the last frame of the document.
 *
 * COMPOSITION (and how it differs from the reference's cta-section)
 *
 * The reference puts headline, buttons and art in ONE flex row: copy in a
 * flex-1 cell, art in a fixed `w-[600px] h-[650px]` column, `object-contain
 * object-bottom` so the subject stands on the panel floor.
 *
 * Two things forced a different structure here, both recorded by the audit:
 *
 * 1. ASPECT. Every frame we own is 2400×1022 (2.34:1). Contained in a 600×650
 *    box it letterboxes to a ~256px strip with 400px of dead black above, and
 *    the bottom-standing silhouette that makes their composition work simply
 *    does not exist in our asset. So the art box became wide and short and
 *    switched to object-cover — the audit's own recommendation for this slot.
 *
 * 2. TYPE SCALE. Their headline gets ~640px of measure beside a 600px art
 *    column at 1400px wide. Ours is a 10-of-12 column inside 1280px; the same
 *    side-by-side split leaves ~515px of measure, which caps "Headcount
 *    shouldn't." at about 54px — not oversized, just medium. So the panel is
 *    two rows instead of one column pair: the headline takes the panel's full
 *    925px measure and runs to 80px, and the art holds the bottom-right block
 *    beneath it, hard against the panel's right and bottom borders.
 *
 * The art is never a dimmed wash. It sits at full strength in its own cell
 * with only the inner (left) edge feathered into the copy — the FeaturePanel
 * discipline, applied to a horizontal block rather than a vertical column.
 * Below lg the art cell is dropped rather than stacked; a letterboxed strip of
 * macro photography on a phone adds nothing.
 *
 * DROPPED FROM THE REFERENCE
 * · `rounded-full` buttons and the mouse-tracked `radial-gradient` spotlight —
 *   both banned outright.
 * · The second filled button ("Book a demo"). Two solid buttons would spend the
 *   accent twice in one viewport for one decision; the secondary is a quiet
 *   ruled link instead.
 * · Their mono kicker is a quantified offer ("1,000 free tasks"). Ours is the
 *   pricing model, which is a fact about the service and not a claim about
 *   results. There is no stat slot in this section and none was added — we
 *   have no clients, so there is no honest number to close on.
 *
 * ACCENT BUDGET: exactly one use — the primary button. Nothing else in this
 * section may take it.
 *
 * No `overflow-hidden` on the <section>: the gutter label is `md:sticky` and
 * any clipping ancestor computes as overflow-y:auto and kills it. The clip
 * lives on the panel, which contains nothing sticky.
 */
export const FinalCTA: React.FC<FinalCTAProps> = ({
  onBookCall,
  index = '10',
  label = 'START',
  id = 'start',
}) => {
  // Panel entrance. Graded by mass, the way the reference grades its ladder:
  // the panel is the heaviest thing here so it travels furthest (12) and
  // arrives fastest (700ms), while the type inside rises 10px over 500ms.
  const [panelRef, panelInView] = useInView<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section id={id} className="relative w-full border-t border-border bg-secondary">
      {/* Static hairline lattice. aria-hidden, zero motion, nothing to degrade. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: LATTICE_ROWS }, (_, i) => (
          <div
            key={`h${i}`}
            className="absolute left-0 right-0 border-t border-foreground/[0.06]"
            style={{ top: `${(100 / (LATTICE_ROWS + 1)) * (i + 1)}%` }}
          />
        ))}
        {Array.from({ length: LATTICE_COLS }, (_, i) => (
          <div
            key={`v${i}`}
            className="absolute top-0 bottom-0 border-l border-foreground/[0.06]"
            style={{ left: `${(100 / (LATTICE_COLS + 1)) * (i + 1)}%` }}
          />
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-[1280px] px-6">
        <div className="grid grid-cols-12 gap-x-6 md:gap-x-8 py-20 md:py-32">
          {/* Left gutter — same mono label device as every other section. */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2 min-w-0 self-start md:sticky md:top-24 mb-8 md:mb-0">
            <div className="row-label">
              {index} / {label}
            </div>
            <div className="hidden md:block mt-3 w-8 border-t border-border" />
          </div>

          {/* Content columns. min-w-0 keeps the oversized type from widening
              the grid track and scrolling the page sideways at 390px. */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10 min-w-0">
            <div
              ref={panelRef}
              className={
                'relative overflow-hidden bg-background border border-foreground/25 ' +
                'transition-[opacity,transform] duration-700 ' +
                (panelInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12')
              }
            >
              {/* Corner registration marks. The reference's device, inverted:
                  it framed a full-ink panel with /10 brackets, we frame a
                  quieter panel with brighter ones. Still 1px, still hairline —
                  the hierarchy is carried by value, not by weight or radius.
                  Sized to stay inside the panel padding at both breakpoints
                  (24 < 32, 48 < 64); at the reference's w-32 the bottom-left
                  bracket rules straight through the terms line. */}
              <div
                aria-hidden
                className="absolute top-0 right-0 w-6 lg:w-12 h-6 lg:h-12 border-b border-l border-foreground/30"
              />
              <div
                aria-hidden
                className="absolute bottom-0 left-0 w-6 lg:w-12 h-6 lg:h-12 border-t border-r border-foreground/30"
              />

              {/* ROW A — the claim, across the panel's full measure. */}
              <div className="relative px-8 lg:px-16 pt-14 lg:pt-24 pb-12 lg:pb-16">
                <Motes count={14} seed={83} />

                <h2 className="relative max-w-[17ch] font-medium tracking-[-0.035em] leading-[1.1] text-[clamp(2rem,6.4vw,5rem)]">
                  {/* Per-glyph entrance — the reference's char-in, via the house
                      CharReveal. One constraint drives the leading: CharReveal
                      clips every glyph to its own line box, so line-height has
                      to clear the descender or the p in "Spend" is cut in half.
                      1.1 is the tightest value that still contains the full
                      content area. An earlier pass ran 1.24 and clawed the two
                      lines back together with -0.26em, which looks right until
                      the headline wraps at 390px — then the gap inside a
                      sentence is larger than the gap between them. Uniform
                      leading, no negative margin. */}
                  <CharReveal as="span" text="Spend should scale." className="block" />
                  <CharReveal
                    as="span"
                    text="Headcount shouldn’t."
                    delay={260}
                    className="block text-muted-foreground"
                  />
                </h2>

                <Reveal
                  as="p"
                  delay={420}
                  className="relative mt-8 max-w-[54ch] text-[15px] md:text-lg leading-relaxed text-muted-foreground"
                >
                  Running creator marketing properly is a team of buyers,
                  negotiators, lawyers and analysts; this is that team as a line
                  item.
                </Reveal>
              </div>

              {/* ROW B — the action, and the art holding the panel's floor.
                  The divider runs the full width and crosses above the art, so
                  the rule frames the image rather than the image interrupting
                  the rule. */}
              <div className="relative flex border-t border-border">
                <div className="flex-1 min-w-0 px-8 lg:px-16 py-10 lg:py-14 flex flex-col justify-center">
                  <Reveal delay={200}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 min-w-0">
                      {onBookCall ? (
                        <button type="button" onClick={onBookCall} className={PRIMARY_CLASSES}>
                          Start a campaign
                          <ArrowUpRight
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5
                                       group-hover:-translate-y-0.5"
                            aria-hidden="true"
                          />
                        </button>
                      ) : (
                        <a href="#booking" className={PRIMARY_CLASSES}>
                          Start a campaign
                          <ArrowUpRight
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5
                                       group-hover:-translate-y-0.5"
                            aria-hidden="true"
                          />
                        </a>
                      )}

                      <a
                        href="#tracking"
                        className="self-start text-sm text-muted-foreground border-b border-border pb-0.5
                                   hover:text-foreground hover:border-foreground transition-colors"
                      >
                        How tracking works
                      </a>
                    </div>
                  </Reveal>
                </div>

                {/* Art cell. Full strength, hard right edge against the panel
                    border, only the inner (left) edge feathered — FeaturePanel's
                    treatment applied to a horizontal block. Wide and short
                    because the asset is 2.34:1; object-bottom keeps the gold
                    impact burst, which is the half of the frame that carries
                    the "arrival" reading. Decorative: the panel is complete
                    without it, which is why it is dropped rather than stacked
                    below lg. */}
                <div className="hidden lg:block relative w-[42%] shrink-0 min-h-[280px] overflow-hidden">
                  <img
                    src="/images/ref-connection.webp"
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover object-bottom"
                  />
                  {/* Inner edge only; middle stop transparent. See FeaturePanel
                      — a `background/25` midpoint dims the entire frame instead
                      of feathering the join to the copy cell. */}
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
                </div>
              </div>

              {/* ROW C — terms. The reference keeps its mono kicker inside the
                  copy column, which here would run it under the art and wrap
                  "cancel any time" onto a second line at 1440. As its own
                  full-measure strip it gets the panel's whole width, gives the
                  art a hard bottom rule to sit on, and closes the panel the way
                  a document closes: rule, then the terms. */}
              <Reveal
                delay={300}
                className="relative border-t border-border px-8 lg:px-16 py-5"
              >
                <p className="num text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  20% of creator budget · month to month · cancel any time
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
