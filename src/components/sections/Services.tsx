import React from 'react';
import { SectionShell } from '@/components/SectionShell';
import { FeaturePanel } from '@/components/FeaturePanel';
import { Reveal } from '@/components/Reveal';

/** One stage of the loop. `span` is the row range it covers, in mono. */
interface Stage {
  word: string;
  span: string;
}

const STAGES: readonly Stage[] = [
  { word: 'Source', span: '01' },
  { word: 'Negotiate', span: '02–04' },
  { word: 'Attribute', span: '05' },
] as const;

interface ServiceRow {
  index: string;
  title: string;
  body: string;
}

const ROWS: readonly ServiceRow[] = [
  {
    index: '01',
    title: 'Sourcing',
    body:
      'We find creators whose audience is actually your buyer, ranked on median recent views rather than subscriber counts.',
  },
  {
    index: '02',
    title: 'Pricing',
    body:
      'We model what a placement is worth on a CPM basis and negotiate against that number, not against a rate card.',
  },
  {
    index: '03',
    title: 'Contracts and briefs',
    body: 'Agreements, deliverables, revision rounds, usage rights.',
  },
  {
    index: '04',
    title: 'Payments',
    body: 'We pay creators, in their currency, on our paper. You get one invoice.',
  },
  {
    index: '05',
    title: 'Attribution',
    body:
      'Every placement gets a unique tracked link; clicks and signups land in a dashboard you can open any time.',
  },
] as const;

/** Rows stagger in at the house 60ms interval. */
const STAGGER_MS = 60;

export const Services: React.FC = () => (
  <SectionShell
    id="services"
    index="01"
    label="SOURCING"
    title="What we run"
    lede="One managed loop: we find the creators, agree the price, run the paperwork and the payments, and track what every placement returns."
  >
      {/* Art holds its own column at full strength — see FeaturePanel. The
          five rows below carry the detail; this carries the weight. */}
      {/* No invented figure in the stat slot. An earlier draft read "14 signals
          per creator" — a number with no source, which is the exact class of
          claim this site cannot carry. The differentiator is true and needs no
          digit. */}
      <FeaturePanel
        index="01"
        title="We find the audience, not the follower count"
        body="Subscriber counts are vanity. We rank creators on median views across recent posts, then model what a placement is worth on a CPM basis and negotiate against that number."
        stat={{ value: 'Median', label: 'views — not subscribers. the number we rank on' }}
        image="/images/hero.webp"
        flip
        className="mb-12"
      />

    {/* The triad. Three cells, hairline-divided, left-aligned. */}
    <Reveal className="border-y border-border grid grid-cols-1 sm:grid-cols-3 divide-y divide-border sm:divide-y-0 sm:divide-x">
      {STAGES.map((stage) => (
        <div key={stage.word} className="min-w-0 py-5 sm:py-6 sm:px-6 sm:first:pl-0">
          <div className="num text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {stage.span}
          </div>
          <div className="mt-2 text-[19px] md:text-[22px] font-medium tracking-[-0.015em] leading-none">
            {stage.word}
          </div>
        </div>
      ))}
    </Reveal>

    {/* Five rows. Mono index, title, one sentence. */}
    <ul className="mt-12 md:mt-16 border-b border-border">
      {ROWS.map((row, i) => (
        <Reveal
          as="li"
          key={row.index}
          delay={i * STAGGER_MS}
          className="rule"
        >
          <div className="grid grid-cols-12 gap-x-4 md:gap-x-8 py-5 md:py-6">
            <div className="col-span-2 md:col-span-1 min-w-0">
              <span className="num text-[12px] text-muted-foreground leading-[1.6]">
                {row.index}
              </span>
            </div>

            <div className="col-span-10 md:col-span-4 min-w-0">
              <h3 className="text-[17px] md:text-[19px] font-medium tracking-[-0.012em] leading-snug">
                {row.title}
              </h3>
            </div>

            <div className="col-span-10 col-start-3 md:col-span-7 md:col-start-auto min-w-0 mt-2 md:mt-0">
              <p className="text-[15px] leading-relaxed text-muted-foreground max-w-[56ch]">
                {row.body}
              </p>
            </div>
          </div>
        </Reveal>
      ))}
    </ul>
  </SectionShell>
);

export default Services;
