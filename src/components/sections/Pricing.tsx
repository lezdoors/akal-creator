import React from 'react';
import { cn } from '@/lib/utils';
import { SectionShell } from '@/components/SectionShell';
import { Reveal } from '@/components/Reveal';
import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';

/* ---------------------------------------------------------------------------
   Section 04 / PRICING

   The model is the pitch: one fee, stated openly, on top of what the client
   pays creators. Nothing here is a claim about results — it is the price list,
   the scope boundary, and the arithmetic. No comparison to other agencies, no
   invented competitor rates.
--------------------------------------------------------------------------- */

const INCLUDED: readonly string[] = [
  'Sourcing and vetting',
  'Price negotiation',
  'Contracts and briefs',
  'Creator payments',
  'Tracked links and attribution',
  'A live client dashboard',
  'A named account lead',
];

const NOT_INCLUDED: readonly { item: string; note?: string }[] = [
  { item: 'The creator fees themselves', note: 'paid at cost — we show you every invoice' },
  { item: 'Paid amplification' },
  { item: 'Content production' },
];

const TERMS: readonly string[] = [
  'Month to month',
  'No retainer, no minimum term',
  'Cancel any time',
];

/** Worked example, in whole dollars. 20% of the creator budget. */
const EXAMPLE_BUDGET = 10_000;
const FEE_RATE = 0.2;
const EXAMPLE_FEE = EXAMPLE_BUDGET * FEE_RATE;
const EXAMPLE_TOTAL = EXAMPLE_BUDGET + EXAMPLE_FEE;

const usd = (n: number): string => `$${Math.round(n).toLocaleString('en-US')}`;

const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Mono figure that counts up once the example enters view. */
const Figure: React.FC<{ value: number; live: boolean; className?: string }> = ({
  value,
  live,
  className,
}) => {
  const shown = useCountUp(live ? value : 0);
  return <span className={cn('col-num', className)}>{usd(shown)}</span>;
};

const ListHead: React.FC<{ title: string; count: number }> = ({ title, count }) => (
  <div className="flex items-baseline justify-between gap-4 pb-3 border-b border-foreground">
    <span className="row-label !text-foreground">{title}</span>
    <span className="num text-[11px] text-muted-foreground">{pad2(count)}</span>
  </div>
);

export interface PricingProps {
  /** Gutter index. Page order owner sets this. Default '04'. */
  index?: string;
  /** Gutter label. Default 'PRICING'. */
  label?: string;
  /** Anchor id. Default 'pricing'. */
  id?: string;
  /** Opens the brief sheet. Falls back to an in-page anchor when absent. */
  onStartCampaign?: () => void;
}

/**
 * Section 04 — the price list.
 *
 * Motion is CSS + IntersectionObserver only: `Reveal` staggers the rows, and
 * the worked-example figures count up once via `useCountUp`, which jumps
 * straight to its target under `prefers-reduced-motion: reduce`.
 *
 * The rose accent appears once here — on the CTA. Nothing else is accented.
 */
export const Pricing: React.FC<PricingProps> = ({
  index = '04',
  label = 'PRICING',
  id = 'pricing',
  onStartCampaign,
}) => {
  const [exampleRef, exampleInView] = useInView<HTMLDivElement>({ threshold: 0.4 });

  return (
    <SectionShell
      id={id}
      index={index}
      label={label}
      title={
        <>
          Your creator budget, plus{' '}
          <span className="num text-[0.86em] tracking-tight">20%</span>.
        </>
      }
      lede="One fee on top of what you spend with creators. It covers the whole operation, sourcing through to reporting, and it is the only thing you pay us."
    >
      <div className="min-w-0">
        {/* Scope. What the 20% buys, and where it stops. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-12 min-w-0">
          <div className="lg:col-span-7 min-w-0">
            <ListHead title="Included" count={INCLUDED.length} />
            <ul className="min-w-0">
              {INCLUDED.map((item, i) => (
                <Reveal
                  as="li"
                  key={item}
                  delay={i * 60}
                  className="flex items-baseline gap-4 py-3 border-b border-border min-w-0"
                >
                  <span className="num text-[11px] text-muted-foreground shrink-0 w-6">
                    {pad2(i + 1)}
                  </span>
                  <span className="text-[15px] md:text-base leading-snug min-w-0">
                    {item}
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5 min-w-0">
            <ListHead title="Not included" count={NOT_INCLUDED.length} />
            <ul className="min-w-0">
              {NOT_INCLUDED.map(({ item, note }, i) => (
                <Reveal
                  as="li"
                  key={item}
                  delay={i * 60}
                  className="flex items-baseline gap-4 py-3 border-b border-border min-w-0"
                >
                  <span className="num text-[11px] text-muted-foreground shrink-0 w-6">
                    {pad2(i + 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] md:text-base leading-snug text-muted-foreground">
                      {item}
                    </span>
                    {note && (
                      <span className="block font-mono text-[12px] leading-relaxed text-muted-foreground mt-1">
                        {note}
                      </span>
                    )}
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>

        {/* Terms. Three mono lines, hairline-separated. */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-3 border-t border-border min-w-0">
          {TERMS.map((term, i) => (
            <Reveal
              key={term}
              delay={i * 80}
              className={cn(
                'py-4 font-mono text-[12.5px] uppercase tracking-[0.1em] leading-snug min-w-0',
                'border-b border-border sm:border-b-0',
                i > 0 && 'sm:border-l sm:border-border sm:pl-5',
                i < TERMS.length - 1 && 'sm:pr-5',
              )}
            >
              {term}
            </Reveal>
          ))}
        </div>

        {/* Worked example. The arithmetic, so the model is unambiguous. */}
        <div ref={exampleRef} className="mt-12 md:mt-16 border border-border min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 md:px-6 py-3 border-b border-border">
            <span className="row-label">Worked example</span>
            <span className="num text-[11px] text-muted-foreground">
              Fee = 20% of creator budget
            </span>
          </div>

          <dl className="px-5 md:px-6 py-1 min-w-0">
            <div className="flex items-baseline justify-between gap-6 py-3 border-b border-border min-w-0">
              <dt className="text-[15px] md:text-base min-w-0">Creator budget</dt>
              <dd className="shrink-0">
                <Figure
                  value={EXAMPLE_BUDGET}
                  live={exampleInView}
                  className="text-[15px] md:text-base text-muted-foreground"
                />
              </dd>
            </div>

            <div className="flex items-baseline justify-between gap-6 py-3 border-b border-border min-w-0">
              <dt className="text-[15px] md:text-base min-w-0">
                AKAL fee
                <span className="num text-[11px] text-muted-foreground ml-2">20%</span>
              </dt>
              <dd className="shrink-0">
                <Figure
                  value={EXAMPLE_FEE}
                  live={exampleInView}
                  className="text-[15px] md:text-base text-muted-foreground"
                />
              </dd>
            </div>

            <div className="flex items-baseline justify-between gap-6 py-4 min-w-0">
              <dt className="text-[15px] md:text-base font-medium min-w-0">
                Total you pay
              </dt>
              <dd className="shrink-0">
                <Figure
                  value={EXAMPLE_TOTAL}
                  live={exampleInView}
                  className="text-xl md:text-2xl font-medium"
                />
              </dd>
            </div>
          </dl>

          <p className="px-5 md:px-6 py-3 border-t border-border font-mono text-[12px] leading-relaxed text-muted-foreground">
            Creator fees are paid at cost. Every invoice is visible to you.
          </p>
        </div>

        {/* CTA. The one rose mark in this section. */}
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 min-w-0">
          {onStartCampaign ? (
            <button
              type="button"
              onClick={onStartCampaign}
              className="h-11 px-6 text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              Start a campaign
            </button>
          ) : (
            <a
              href="#booking"
              className="inline-flex items-center h-11 px-6 text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              Start a campaign
            </a>
          )}
          <span className="font-mono text-[12.5px] text-muted-foreground">
            Priced on your budget, not on hours.
          </span>
        </div>
      </div>
    </SectionShell>
  );
};

export default Pricing;
