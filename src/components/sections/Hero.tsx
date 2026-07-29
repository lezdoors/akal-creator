import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AttributionLedger } from '@/components/AttributionLedger';
import { Motes } from '@/components/Motes';

interface HeroProps {
  onBookCall: () => void;
}

/** Copy lives inline. i18n is retired — do not reintroduce locale keys. */
export const Hero: React.FC<HeroProps> = ({ onBookCall }) => {
  return (
    <section className="relative overflow-hidden px-6 md:px-10 pt-32 pb-16 md:pt-40 md:pb-24">
      {/* The reference hero is entirely atmosphere: a full-bleed frame with a
          hairline lattice ruled over it. We take the lattice and leave the
          frame — the right column here is the AttributionLedger, the signature
          of the whole site, and an image behind an opaque data table would be
          occluded to nothing. So the ground gets structure rather than art:
          the same ruled grammar as the document below, at an alpha where it
          reads as a plate and never competes with the headline.
          (Logged as an image gap: a hero frame would need a composition that
          gives it a real column, which this two-column split has no room for.) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.5]">
        {[12.5, 25, 37.5, 50, 62.5, 75, 87.5].map((t) => (
          <span key={`h${t}`} className="absolute inset-x-0 h-px bg-border" style={{ top: `${t}%` }} />
        ))}
        {[8.33, 16.66, 25, 33.33, 41.66, 50, 58.33, 66.66, 75, 83.33, 91.66].map((l) => (
          <span key={`v${l}`} className="absolute inset-y-0 w-px bg-border" style={{ left: `${l}%` }} />
        ))}
      </div>
      {/* Drifting light, as on every other dark panel. 26 across a full
          viewport is the same density FeaturePanel runs at panel scale. */}
      <Motes count={26} seed={11} />

      <div className="relative max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left column — the claim */}
          <div className="lg:col-span-5 min-w-0">
            <div className="row-label animate-appear mb-6">
              Creator marketing · managed end to end
            </div>

            {/* Fluid display type. The reference caps at 7rem with leading .92;
                ours is narrower (the ledger takes 7 of 12 columns) so it tops
                out lower, but the ratio is the point — tight leading and real
                scale are what read as confidence.

                Two-tone: the claim in ink, the qualifier dropped to muted. No
                accent — register rule 6 keeps hue out of headings. The emphasis
                is value contrast, which is the device the reference actually
                uses and the reason its headlines land. */}
            <h1
              className="font-medium tracking-tight leading-[0.95] mb-6 animate-appear delay-100
                         text-[clamp(2.5rem,4.4vw,4.25rem)]"
            >
              <span className="text-foreground">Creator marketing</span>{' '}
              <span className="text-muted-foreground">that reports like a paid channel.</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 animate-appear delay-300">
              We source, price, contract and pay creators for B2B software
              companies. Every placement carries a tracked link, so you see
              clicks and signups per creator, not impressions and a screenshot.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 animate-appear delay-300">
              <button
                onClick={onBookCall}
                className="group inline-flex items-center justify-center gap-2 bg-foreground text-background
                           text-[11px] uppercase tracking-[0.18em] font-semibold px-8 py-4
                           hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Start a campaign
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border border-foreground/30
                           text-foreground text-[11px] uppercase tracking-[0.18em] font-semibold px-8 py-4
                           hover:bg-foreground hover:text-background transition-colors"
              >
                How tracking works
              </a>
            </div>

            <p className="row-label mt-8 animate-appear delay-700">
              20% of creator budget · month to month · cancel any time
            </p>
          </div>

          {/* Right column — the product, running.
              min-w-0 is load-bearing: grid children default to min-width:auto,
              so without it the ledger's min-w table forces the whole page wide
              and the body scrolls horizontally on mobile. */}
          <div className="lg:col-span-7 min-w-0 animate-appear-zoom delay-300">
            <AttributionLedger />
          </div>
        </div>
      </div>
    </section>
  );
};
