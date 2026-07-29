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

/**
 * Mirrors a FeaturePanel so the art holds the LEFT column instead of the right.
 *
 * FeaturePanel has no `side` prop and lives in another agent's file, so the
 * mirror is done from the call site: `flex-row-reverse` swaps the two columns,
 * and the second class re-points the panel's inner feather. That feather is
 * `bg-gradient-to-r` — it dissolves the art's LEFT edge into the copy. Once the
 * columns swap, the inner edge is the art's right edge, so the gradient has to
 * run the other way or the panel feathers at its outer border and leaves a dead
 * band against the frame.
 *
 * This is deliberately the only DOM-coupled class on the page. The proper fix is
 * a `side` prop on FeaturePanel; until whoever owns that file adds one, the
 * failure mode here is soft (feather on the wrong edge, never a crash).
 */
const ART_LEFT = 'flex-row-reverse [&>div:last-child>div]:bg-gradient-to-l';

export interface ServicesProps {
  /** Gutter index. The page owner sets the running order — see Index.tsx. */
  index?: string;
  /** Gutter label. */
  label?: string;
  /** Anchor id. */
  id?: string;
}

export const Services: React.FC<ServicesProps> = ({
  index = '01',
  label = 'SOURCING',
  id = 'services',
}) => (
  <SectionShell
    id={id}
    index={index}
    label={label}
    title="What we run"
    lede="One managed loop: we find the creators, agree the price, run the paperwork and the payments, and track what every placement returns."
  >
      {/* A STACK of panels, not one panel plus a list — the reference's
          features-section proportion. Art holds its own full-strength column in
          every one (see FeaturePanel), and the side alternates right / left /
          right so the eye crosses the page three times on the way down.

          Where we diverge from the reference, and why: its panel stack is
          load-bearing on figures — a headline metric per card, plus a canvas
          sparkline reading as live telemetry. We have no clients, so every one
          of those slots would have to be invented. The slot is therefore
          re-cut: each stat carries a MODEL FACT or a PROCESS COMMITMENT — the
          thing we rank on, the number of invoices, the link-to-placement ratio.
          All three are true today with zero campaigns run, and none of them
          moves when we sign a client.

          (The earlier bug in this slot read "14 signals per creator" — a figure
          with no source. That is the exact class of claim this site cannot
          carry, in any slot, at any size.) */}
      <div className="grid grid-cols-1 gap-6 md:gap-8 mb-12">
        <FeaturePanel
          index="01"
          title="We find the audience, not the follower count"
          body="Subscriber counts are vanity. We rank creators on median views across recent posts, then model what a placement is worth on a CPM basis and negotiate against that number."
          stat={{ value: 'Median', label: 'views — not subscribers. the number we rank on' }}
          image="/images/mo-array.webp"
          flip
          className="min-w-0"
        />

        {/* Art left. Flipped so the frame's motion travels away from the copy
            rather than into it. */}
        <FeaturePanel
          index="02"
          title="We run the paperwork and we pay the creators"
          body="Agreements, deliverables, revision rounds and usage rights are ours to chase. Creators are paid in their own currency, on our paper, so nothing routes through your finance team."
          stat={{ value: '1', label: 'invoice — we pay every creator ourselves' }}
          image="/images/mo-reticle.webp"
          flip
          className={`min-w-0 ${ART_LEFT}`}
        />

        <FeaturePanel
          index="03"
          title="Every placement carries a tracked link"
          body="One link per placement, issued before the video goes live. Clicks and signups land against the creator who earned them, in a dashboard you can open any time — which is what makes a creator campaign report the way a paid channel does."
          stat={{ value: '1:1', label: 'tracked link per placement, issued before publish' }}
          image="/images/mo-crossing2.webp"
          className="min-w-0"
        />
      </div>

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
