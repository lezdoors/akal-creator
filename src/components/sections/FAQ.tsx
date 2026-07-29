import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SectionShell } from '@/components/SectionShell';
import { Reveal } from '@/components/Reveal';

/* ---------------------------------------------------------------------------
   Small ledger primitives, local to this section.
   Hairline rows, mono figures, right-aligned to a column axis. No cards.
--------------------------------------------------------------------------- */

interface LineProps {
  /** Left-hand label, sans. */
  label: string;
  /** Right-hand figure. Always mono + tabular via `.col-num`. */
  value: string;
  /** Emphasise the settled row (the invoice total, the shipped step). */
  strong?: boolean;
}

const Line: React.FC<LineProps> = ({ label, value, strong = false }) => (
  <div className="flex min-w-0 items-baseline justify-between gap-4 border-b border-border py-2.5">
    <span
      className={`min-w-0 text-[13px] leading-snug ${
        strong ? 'text-foreground' : 'text-muted-foreground'
      }`}
    >
      {label}
    </span>
    <span
      className={`col-num shrink-0 text-[13px] ${
        strong ? 'font-medium text-foreground' : 'text-muted-foreground'
      }`}
    >
      {value}
    </span>
  </div>
);

interface StepProps {
  /** Two-digit step number. Mono. */
  n: string;
  children: React.ReactNode;
}

const Step: React.FC<StepProps> = ({ n, children }) => (
  <li className="flex min-w-0 gap-4 border-b border-border py-2.5">
    <span className="num shrink-0 text-[11px] leading-[1.5rem] text-muted-foreground">
      {n}
    </span>
    <span className="min-w-0 text-[13px] leading-relaxed text-muted-foreground">
      {children}
    </span>
  </li>
);

/**
 * Provenance stamp. Any figure on this page that is not a client result says so.
 *
 * Set in ink at the row-label's own 11px, not shrunk to 10px muted: muted grey
 * (#737373) on paper (#FAF8F1) is 4.46:1, under the 4.5:1 floor for text this
 * size. A disclaimer that fails contrast is not a disclaimer.
 */
const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="row-label mt-3 !text-foreground">{children}</p>
);

const Body: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <p className={`max-w-[62ch] text-[14px] leading-relaxed text-muted-foreground ${className}`}>
    {children}
  </p>
);

/* ---------------------------------------------------------------------------
   Content. Inline — i18n is retired. Nothing here is a claim we cannot stand
   behind: pricing model, mechanics, limits, and an honest "no case studies".
--------------------------------------------------------------------------- */

interface FaqEntry {
  id: string;
  /** Mono index in the left column of the row. */
  n: string;
  q: string;
  a: React.ReactNode;
}

const ENTRIES: FaqEntry[] = [
  {
    id: 'pricing',
    n: '01',
    q: 'What exactly do I pay for?',
    a: (
      <>
        <Body>
          Creator budget at cost, plus <span className="num">20%</span> of that
          budget as our fee. One invoice, two lines. We do not mark up creator
          rates, take rebates from creators, or bill separately for sourcing,
          negotiation, contracts, briefs, payment handling or reporting — that
          work is the <span className="num">20%</span>. Month to month, cancel
          anytime.
        </Body>
        <div className="mt-5 max-w-[420px] border-t border-border">
          <Line label="Creator budget (paid to creators)" value="$10,000" />
          <Line label="AKAL fee — 20% of budget" value="$2,000" />
          <Line label="Invoiced to you" value="$12,000" strong />
        </div>
        <Note>Example arithmetic · not a minimum and not a client figure</Note>
      </>
    ),
  },
  {
    id: 'tracking',
    n: '02',
    q: 'How does the tracking actually work?',
    a: (
      <>
        <Body>
          Every creator gets their own link. Nothing is shared, so nothing has to
          be untangled afterwards.
        </Body>
        <ol className="mt-5 max-w-[62ch] border-t border-border">
          <Step n="01">
            A unique short link is issued per creator, per placement, and goes in
            the description, the pinned comment, or wherever that platform allows.
          </Step>
          <Step n="02">
            The click hits our endpoint, which records the creator, the placement
            and a click ID, then <span className="num">302</span>-redirects to
            your site with the parameters attached.
          </Step>
          <Step n="03">
            Your site sets a first-party cookie on your own domain. No third-party
            pixel, no script we ask you to embed on every page.
          </Step>
          <Step n="04">
            When someone signs up, your server posts the event back to us with the
            click ID. The signup lands on that creator's row.
          </Step>
        </ol>
        <Body className="mt-6">
          The honest limits: ad blockers and privacy browsers drop a share of
          clicks before they reach us. Cross-device breaks the chain — someone
          watches on a phone and signs up on a laptop, and to any cookie those are
          two different people. And a lot of creator-driven demand never clicks at
          all: people hear your name, then search for it, and arrive through
          organic or paid search. So attributed signups are a floor, not a total.
          Anyone selling you <span className="num">100%</span> attribution is
          selling you something.
        </Body>
      </>
    ),
  },
  {
    id: 'relationships',
    n: '03',
    q: 'Who owns the creator relationships?',
    a: (
      <>
        <Body>
          You do. We contract and pay creators so you get one invoice instead of
          nine, but nothing in those agreements locks a creator to us — no
          exclusivity, no non-compete pointing back at AKAL, no clause that makes
          you route future work through us.
        </Body>
        <Body className="mt-4">
          Ask and we will introduce you directly, by email, and step out of the
          thread. A relationship you cannot keep is not worth paying for.
        </Body>
      </>
    ),
  },
  {
    id: 'underperformance',
    n: '04',
    q: 'What if a placement underperforms?',
    a: (
      <>
        <Body>
          You see it, on the same report as the ones that worked. Every placement
          keeps its own line — fee, clicks, signups, cost per signup — so a bad
          result cannot be averaged into a channel-level number or quietly dropped
          from a summary.
        </Body>
        <Body className="mt-4">
          Some placements will miss. That is what per-creator data is for: we use
          it to decide who gets re-booked and who does not, we tell you when we got
          a call wrong, and we move the remaining budget rather than defend the
          pick.
        </Body>
      </>
    ),
  },
  {
    id: 'timeline',
    n: '05',
    q: 'How fast can we start?',
    a: (
      <>
        <Body>
          About a week to a priced shortlist. Going live after that depends on
          creator calendars, which we do not control — the creators worth booking
          plan content weeks ahead.
        </Body>
        <div className="mt-5 max-w-[480px] border-t border-border">
          <Line label="Intake call — ICP, offer, what a good signup is worth" value="Day 1" />
          <Line label="Shortlist, rates and rationale back to you" value="~ 1 week" />
          <Line label="Contracts, briefs, tracking links issued" value="2–4 days" />
          <Line label="First placements live" value="Calendar-led" strong />
        </div>
        <Note>Typical sequence · the last line moves with each creator's schedule</Note>
      </>
    ),
  },
  {
    id: 'case-studies',
    n: '06',
    q: 'Do you have case studies?',
    a: (
      <>
        <Body>
          No. AKAL Creator is new. We are not going to show you someone else's
          numbers with our name on them, and we are not going to invent a chart.
        </Body>
        <Body className="mt-4">
          When we do publish results it will be with the client's written consent,
          with the real figures, and with the placements that lost money still in
          the table. Until then what we can show you is the machinery: the link
          setup, the redirect and postback working end to end, the report you would
          actually receive, and the pricing arithmetic above. We would rather walk
          you through attribution running on one live test placement than talk you
          through a slide.
        </Body>
      </>
    ),
  },
];

/* ------------------------------------------------------------------------- */

export interface FAQProps {
  /** Gutter index. The page owner sets the running order — see Index.tsx. */
  index?: string;
  /** Gutter label. */
  label?: string;
  /** Anchor id. */
  id?: string;
}

export const FAQ: React.FC<FAQProps> = ({
  index = '09',
  label = 'QUESTIONS',
  id = 'faq',
}) => (
  <SectionShell
    id={id}
    index={index}
    label={label}
    title="The questions worth asking before you sign."
    lede="Answered plainly, including the parts that make us look smaller than we would like."
  >
    <Accordion type="single" collapsible className="min-w-0 border-t border-border">
      {ENTRIES.map((entry, i) => (
        <Reveal key={entry.id} delay={i * 60} className="min-w-0">
          <AccordionItem value={entry.id} className="min-w-0 border-b border-border">
            <AccordionTrigger
              className="group min-w-0 items-start gap-4 py-5 text-left font-medium
                         hover:no-underline focus-visible:outline-none
                         focus-visible:ring-1 focus-visible:ring-foreground/40
                         [&>svg]:hidden"
            >
              <span className="num shrink-0 pt-[3px] text-[11px] leading-none text-muted-foreground">
                {entry.n}
              </span>

              <span className="min-w-0 flex-1 text-[15px] leading-snug tracking-[-0.005em] text-foreground md:text-base">
                {entry.q}
              </span>

              <span
                aria-hidden
                className="num shrink-0 pt-[1px] text-[15px] leading-none text-muted-foreground
                           transition-transform duration-200
                           group-data-[state=open]:rotate-45
                           group-data-[state=open]:text-foreground"
              >
                +
              </span>
            </AccordionTrigger>

            <AccordionContent className="min-w-0 pb-7 pt-0 md:pl-[3.5rem]">
              {entry.a}
            </AccordionContent>
          </AccordionItem>
        </Reveal>
      ))}
    </Accordion>
  </SectionShell>
);

export default FAQ;
