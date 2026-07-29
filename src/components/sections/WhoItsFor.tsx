import React from 'react';
import { cn } from '@/lib/utils';
import { SectionShell } from '@/components/SectionShell';
import { Reveal } from '@/components/Reveal';

interface FitItem {
  /** Stable key. */
  id: string;
  /** Row copy. A node so figures can carry the mono `.num` face. */
  text: React.ReactNode;
}

/** Qualifiers. Each one is a fact the prospect can check about themselves. */
const WORKS: readonly FitItem[] = [
  { id: 'category', text: 'Sell B2B software, developer tools, or AI products.' },
  {
    id: 'signal',
    text: 'Have a signup or a trial — an action a tracked link can be measured against.',
  },
  {
    id: 'budget',
    text: (
      <>
        Can commit <span className="num">$5,000</span>+ a month of creator budget.
      </>
    ),
  },
  { id: 'paid', text: 'Already run paid acquisition and think in CPA.' },
];

/** Disqualifiers. Saying these out loud is the credibility — we have no logos. */
const WONT: readonly FitItem[] = [
  {
    id: 'awareness',
    text: 'Need brand awareness with no measurable action at the end of it.',
  },
  { id: 'cycle', text: 'Sell into procurement cycles longer than a year.' },
  { id: 'production', text: 'Want us to produce the content.' },
  { id: 'viral', text: 'Are looking for one viral post rather than a channel.' },
];

const pad = (n: number): string => String(n + 1).padStart(2, '0');

const FitColumn: React.FC<{
  /** Mono gutter tag for the column, e.g. 'FITS'. */
  tag: string;
  heading: string;
  items: readonly FitItem[];
  /** Disqualifier column reads back one value — no colour used to say 'no'. */
  muted?: boolean;
  /** Stagger offset so the two columns don't fire in lockstep. */
  baseDelay?: number;
  className?: string;
}> = ({ tag, heading, items, muted = false, baseDelay = 0, className }) => (
  <div className={cn('min-w-0', className)}>
    <Reveal delay={baseDelay} className="min-w-0">
      <div className="num text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {tag} / {pad(items.length - 1)}
      </div>
      <h3 className="mt-3 text-lg md:text-xl font-medium tracking-[-0.015em] text-foreground">
        {heading}
      </h3>
    </Reveal>

    <ul className="mt-6 min-w-0">
      {items.map((item, i) => (
        <Reveal
          as="li"
          key={item.id}
          delay={baseDelay + 80 + i * 60}
          className="flex gap-4 md:gap-6 border-t border-border py-4 min-w-0"
        >
          <span className="num text-[11px] leading-6 text-muted-foreground shrink-0">
            {pad(i)}
          </span>
          <span
            className={cn(
              'min-w-0 text-[15px] leading-6 max-w-[38ch]',
              muted ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            {item.text}
          </span>
        </Reveal>
      ))}
    </ul>
  </div>
);

export interface WhoItsForProps {
  /** Gutter index. The page owner sets the running order — see Index.tsx. */
  index?: string;
  /** Gutter label. */
  label?: string;
  /** Anchor id. */
  id?: string;
}

/**
 * FIT — where this works, and where it does not.
 *
 * Two hairline-separated columns: where this works, and where it does not.
 * There are no logos, no case studies and no testimonials on this site because
 * there are none to show. Being specific about the cases we are wrong for is
 * the only proof available that costs us anything, so it carries the section.
 *
 * Motion is `Reveal` (CSS + IntersectionObserver) only, and survives
 * `prefers-reduced-motion: reduce` — Reveal renders plainly visible there.
 */
export const WhoItsFor: React.FC<WhoItsForProps> = ({
  index = '08',
  label = 'FIT',
  id = 'fit',
}) => (
  <SectionShell
    id={id}
    index={index}
    label={label}
    title="Worth knowing before you book a call."
    lede="Creator marketing only reports like a paid channel when there is something at the end of the link to report on. Here is where that holds, and where it doesn’t."
  >
    <div className="grid grid-cols-1 md:grid-cols-2 min-w-0">
      <FitColumn
        tag="Works"
        heading="This works if you"
        items={WORKS}
        className="md:pr-8 lg:pr-12"
      />
      <FitColumn
        tag="Doesn’t"
        heading="This won’t work if you"
        items={WONT}
        muted
        baseDelay={120}
        className={cn(
          'mt-12 pt-12 border-t border-border',
          'md:mt-0 md:pt-0 md:border-t-0 md:border-l md:border-border md:pl-8 lg:pl-12',
        )}
      />
    </div>

    <Reveal
      delay={200}
      className="mt-12 pt-5 border-t border-border max-w-[62ch] min-w-0"
    >
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        We have no client logos, case studies or testimonials to show you — this is
        a new practice and we will not borrow anyone else’s numbers. Telling you
        where the model breaks is the only proof we have that costs us something.
      </p>
    </Reveal>
  </SectionShell>
);

export default WhoItsFor;
