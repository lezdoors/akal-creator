import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

export interface FinalCTAProps {
  /**
   * Opens the booking dialog. When omitted the primary CTA degrades to an
   * in-page link to the booking section, so the button is never inert.
   */
  onBookCall?: () => void;
}

const PRIMARY_CLASSES =
  'group inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground ' +
  'text-[11px] uppercase tracking-[0.18em] font-semibold px-8 py-4 ' +
  'hover:bg-foreground hover:text-background transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-background';

/**
 * Closing CTA. The last row of the document: hairline rule, gutter label,
 * oversized left-aligned claim, one accent CTA, one quiet link, one mono
 * terms line.
 *
 * Geometry mirrors SectionShell (1280px / px-6 / 12 columns / sticky gutter
 * label) rather than using it, because the closing headline is deliberately
 * larger than a section title and SectionShell fixes that size.
 *
 * The accent appears exactly once here — the primary button. Nothing else in
 * this section is allowed to take it.
 */
export const FinalCTA: React.FC<FinalCTAProps> = ({ onBookCall }) => (
  <section id="start" className="w-full border-t border-border">
    <div className="mx-auto w-full max-w-[1280px] px-6">
      <div className="grid grid-cols-12 gap-x-6 md:gap-x-8 py-20 md:py-32">
        {/* Left gutter — same mono label device as every other section. */}
        <div className="col-span-12 md:col-span-3 lg:col-span-2 min-w-0 self-start md:sticky md:top-24 mb-8 md:mb-0">
          <div className="row-label">08 / START</div>
          <div className="hidden md:block mt-3 w-8 border-t border-border" />
        </div>

        {/* Content columns. min-w-0 keeps the oversized type from widening
            the grid track and scrolling the page sideways at 390px. */}
        <div className="col-span-12 md:col-span-9 lg:col-span-10 min-w-0">
          <Reveal
            as="h2"
            className="max-w-[16ch] font-medium leading-[0.98] tracking-[-0.035em]
                       text-[clamp(2.5rem,7.5vw,5.5rem)]"
          >
            Spend should scale.
            <span className="block text-muted-foreground">Headcount shouldn&rsquo;t.</span>
          </Reveal>

          <Reveal
            as="p"
            delay={100}
            className="mt-8 max-w-[52ch] text-[15px] md:text-lg leading-relaxed text-muted-foreground"
          >
            Running creator marketing properly is a team of buyers, negotiators,
            lawyers and analysts; this is that team as a line item.
          </Reveal>

          <Reveal delay={200} className="mt-12 md:mt-16 border-t border-border pt-8">
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
                href="#how-it-works"
                className="self-start text-sm text-muted-foreground border-b border-border pb-0.5
                           hover:text-foreground hover:border-foreground transition-colors"
              >
                How tracking works
              </a>
            </div>

            <p className="num mt-8 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              20% of creator budget · month to month · cancel any time
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

export default FinalCTA;
