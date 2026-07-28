import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AttributionLedger } from '@/components/AttributionLedger';

interface HeroProps {
  onBookCall: () => void;
}

/** Copy lives inline. i18n is retired — do not reintroduce locale keys. */
export const Hero: React.FC<HeroProps> = ({ onBookCall }) => {
  return (
    <section className="relative px-6 md:px-10 pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left column — the claim */}
          <div className="lg:col-span-5 min-w-0">
            <div className="row-label animate-appear mb-6">
              Creator marketing · managed end to end
            </div>

            <h1
              className="font-medium tracking-tight leading-[1.02] text-foreground
                         text-[2.75rem] sm:text-5xl lg:text-[3.5rem] mb-6 animate-appear delay-100"
            >
              {/* No hue in the headline. Register rule 6: the accent is for CTAs
                  and live-data marks — never headings. Emphasis here is value and
                  position, not colour. */}
              Creator marketing that reports like a paid channel.
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
