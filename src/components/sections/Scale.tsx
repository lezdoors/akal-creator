import React from 'react';
import { cn } from '@/lib/utils';
import { SectionShell } from '@/components/SectionShell';
import { FeaturePanel } from '@/components/FeaturePanel';
import { ConnectorField } from '@/components/ConnectorField';
import { Reveal } from '@/components/Reveal';

/**
 * Scale — the reach section, modelled on the reference's "Global by default"
 * infrastructure block.
 *
 * WHAT WAS PORTED, AND WHAT WAS NOT
 *
 * Portable, and taken: the geometry. A large mono figure with a mono caption
 * over a self-drawing connector lattice on the left, two stacked stat cells on
 * the right, a four-up card row beneath, and the reference's entrance ladder
 * (things that MOVE run faster than things that only FADE, and each group
 * staggers on its own axis so two reveals never read as one confused wave).
 *
 * NOT portable, and deliberately rebuilt: every slot the reference fills with
 * a number. Theirs holds region counts, uptime and latency. We have no traffic,
 * no clients and no results, so there is nothing true to put in those slots and
 * we will not invent anything — so each one holds a *capability* or a *defined
 * term* instead. Where a figure does appear here it is a COUNT OF THE LIST
 * PRINTED BESIDE IT (four surfaces, three placement types, two events), which
 * the reader can verify on the page itself, or the literal `01` of one tracked
 * link per placement. None of them is a performance claim, and none of them can
 * become one later without someone rewriting the list next to it.
 *
 * Also dropped from the reference: its 3s auto-rotating region highlight. It is
 * a background-tab timer moving a highlight the user cannot influence and which
 * carries no information — its own cards are `cursor-default`. Our cards are
 * static and say more.
 *
 * No accent is used in this section beyond the lattice's own. The accent budget
 * is three marks per viewport and ConnectorField already spends it; there is no
 * CTA and no live figure here to spend it on.
 */

/** A surface we source and buy placements on, and where the link lives on it. */
interface Surface {
  index: string;
  name: string;
  /** What the placement is on this surface. */
  body: string;
  /** Where the tracked link physically sits. A defined term, not a metric. */
  linkSlot: string;
}

const SURFACES: readonly Surface[] = [
  {
    index: '01',
    name: 'YouTube',
    body: 'Long-form reviews, build-alongs and comparisons, from channels whose viewers write code or buy tools.',
    linkSlot: 'description · pinned comment',
  },
  {
    index: '02',
    name: 'Podcasts',
    body: 'Host-read segments inside developer, data and founder shows, scripted from a brief and read in the host’s own words.',
    linkSlot: 'show notes · episode page',
  },
  {
    index: '03',
    name: 'Newsletters',
    body: 'Sponsored slots in engineering and operator newsletters, where the list is the audience and the archive keeps working.',
    linkSlot: 'ad block',
  },
  {
    index: '04',
    name: 'Short-form',
    body: 'Shorts, X and LinkedIn posts — usually bought alongside a long-form placement with the same creator, not on their own.',
    linkSlot: 'bio · post · first comment',
  },
] as const;

/** A defined term, printed with its definition. Replaces a metric slot. */
interface Term {
  term: string;
  gloss: string;
}

const PLACEMENT_TYPES: readonly Term[] = [
  { term: 'Integrated', gloss: 'A segment inside the creator’s own piece.' },
  { term: 'Dedicated', gloss: 'The whole piece is the placement.' },
  { term: 'Series', gloss: 'One creator, a fixed number of placements, agreed up front.' },
] as const;

const EVENTS: readonly Term[] = [
  { term: 'click', gloss: 'The tracked link is opened. Creator, placement and time are recorded.' },
  { term: 'signup', gloss: 'That visitor creates an account, and it resolves to the same placement.' },
] as const;

/** House stagger. */
const STAGGER_MS = 60;

/** A stat cell — the reference's metric card, holding a term set instead. */
const TermCell: React.FC<{
  label: string;
  /** Count of the terms below it. A count of the visible list, never a claim. */
  count: string;
  terms: readonly Term[];
  className?: string;
}> = ({ label, count, terms, className }) => (
  <div className={cn('min-w-0 p-6 md:p-8', className)}>
    <div className="flex items-baseline justify-between gap-4">
      <div className="num text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="col-num text-[13px] text-muted-foreground">{count}</div>
    </div>
    <dl className="mt-5 space-y-3">
      {terms.map((t) => (
        <div key={t.term} className="min-w-0">
          <dt className="num text-[13px] md:text-sm text-foreground">{t.term}</dt>
          <dd className="mt-1 text-[14px] leading-relaxed text-muted-foreground max-w-[42ch]">
            {t.gloss}
          </dd>
        </div>
      ))}
    </dl>
  </div>
);

export interface ScaleProps {
  /** Gutter index. The page owner sets the running order — see Index.tsx. */
  index?: string;
  /** Gutter label. */
  label?: string;
  /** Anchor id. */
  id?: string;
}

export const Scale: React.FC<ScaleProps> = ({
  index = '04',
  label = 'REACH',
  id = 'reach',
}) => (
  <SectionShell
    id={id}
    index={index}
    label={label}
    title="Reach scales. The unit of measurement doesn’t."
    lede="We buy across four surfaces and three placement types. However wide a campaign goes, every placement still resolves to one link, one creator, one row."
  >
    {/* Top block — one bordered frame, split by hairlines rather than gaps, so
        it reads as a table rather than as three floating cards. The lattice is
        scoped to the figure cell only: overflow-hidden here is safe because no
        descendant is sticky (the section's sticky gutter label is a sibling,
        two levels up). */}
    <Reveal className="border border-border">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* The figure. `01` is not a metric — it is the literal count of
            tracked links on a placement, and it is the whole argument of the
            section: reach is the thing that grows, the record is the thing
            that doesn't. */}
        <div className="relative min-w-0 lg:col-span-7 overflow-hidden border-b border-border lg:border-b-0 lg:border-r">
          <ConnectorField cols={4} rows={3} lines={5} seed={Number(index) * 7 + 3} />
          <div className="relative p-6 md:p-10 lg:p-12">
            <div className="num text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              PER PLACEMENT
            </div>
            <div className="mt-6 flex items-end gap-5">
              <span className="num text-[clamp(4.5rem,13vw,9rem)] leading-[0.82] tracking-[-0.04em] text-foreground">
                01
              </span>
              <span className="num pb-2 text-[13px] leading-snug text-muted-foreground max-w-[16ch]">
                tracked link,
                <br />
                issued by us
              </span>
            </div>
            <p className="mt-8 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
              A twenty-minute review, a forty-second read and a line in a
              newsletter are three different pieces of work and one identical
              record. Add a surface, add a creator, add a market — the link is
              never shared between two placements, so a click never has to be
              split between two creators.
            </p>
          </div>
        </div>

        {/* Two stacked stat cells. Where the reference prints uptime and
            latency, these print the vocabulary the ledger is written in. */}
        <div className="min-w-0 lg:col-span-5 divide-y divide-border">
          <TermCell label="PLACEMENT TYPES" count="03" terms={PLACEMENT_TYPES} />
          <TermCell label="EVENTS RECORDED" count="02" terms={EVENTS} />
        </div>
      </div>
    </Reveal>

    {/* Honest limit, stated where the metrics would have been. The reference
        would put a precision figure here; "100% precise attribution" is not
        achievable by anyone, so the truthful version of that slot is this. */}
    <Reveal delay={100} className="mt-4">
      <p className="num text-[12px] leading-relaxed text-muted-foreground max-w-[76ch]">
        Two events, both first-party. Anything else you want counted — activation,
        revenue, seats — has to be sent to us from your side. We do not infer it.
      </p>
    </Reveal>

    {/* The four-up. border-l/-t on the frame and border-r/-b on each cell, so
        the grid stays ruled correctly at 1, 2 and 4 columns without divide-x
        breaking on the wrap. */}
    <div className="mt-12 md:mt-16 border-l border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {SURFACES.map((s, i) => (
        <Reveal
          key={s.index}
          delay={i * STAGGER_MS}
          className="min-w-0 border-r border-b border-border p-6 md:p-7 flex flex-col"
        >
          <div className="num text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {s.index}
          </div>
          <h3 className="mt-3 text-[19px] md:text-[21px] font-medium tracking-[-0.015em] leading-none">
            {s.name}
          </h3>
          <p className="mt-4 flex-1 text-[14px] leading-relaxed text-muted-foreground">
            {s.body}
          </p>
          <div className="mt-6 pt-4 border-t border-border">
            <div className="num text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              LINK SITS IN
            </div>
            <div className="num mt-1.5 text-[12px] text-foreground">{s.linkSlot}</div>
          </div>
        </Reveal>
      ))}
    </div>

    {/* ref-world.webp fills the reference's world-map slot (its infrastructure
        panel). network.webp (our HF lattice) remains the swap-in candidate —
        literally the subject — many surfaces, one connected record. It is held
        in FeaturePanel's own full-strength 42% column rather than dimmed behind
        the copy, and it is placed at the far end of the section from the
        ConnectorField above so the two lattices rhyme instead of collide.
        The stat slot carries a term, not a figure: there is no honest number
        for the size of a roster we have not booked yet. */}
    <FeaturePanel
      index={index}
      title="One roster, priced per surface"
      body="The same creator is worth a different number on a twenty-minute review than in a newsletter slot, and we price each surface on its own median views. The brief, the paperwork and the payment run once."
      stat={{ value: 'One invoice', label: 'you pay us; we pay every creator, in their currency' }}
      image="/images/ref-world.webp"
      className="mt-12 md:mt-16"
    />
  </SectionShell>
);

export default Scale;
