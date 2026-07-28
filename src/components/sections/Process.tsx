import React from 'react';
import { SectionShell } from '@/components/SectionShell';
import { Reveal } from '@/components/Reveal';

interface Step {
  /** Two-digit mono index shown in the step gutter. */
  n: string;
  /** Mono sub-label under the index. */
  kicker: string;
  /** The step itself, set in wide type. */
  body: string;
  /** Step 03 is the only one carrying the live-data mark. */
  live?: boolean;
}

const STEPS: readonly Step[] = [
  {
    n: '01',
    kicker: 'Brief',
    body: 'You give us an audience, a budget, and the metric that matters.',
  },
  {
    n: '02',
    kicker: 'Shortlist',
    body: 'You approve a shortlist. We handle contracts, briefs, and payment.',
  },
  {
    n: '03',
    kicker: 'Dashboard',
    body: 'You watch the dashboard. Per-creator clicks, signups, and CPA — updated as they land.',
    live: true,
  },
];

/**
 * 02 / PROCESS — "How it works".
 *
 * Three hairline-separated rows, mono index in the step gutter, the step itself
 * in wide type. No cards, no icons, no imagery. The single rose mark sits on
 * step 03, where the data is actually live.
 */
export const Process: React.FC = () => (
  <SectionShell
    id="how-it-works"
    index="02"
    label="PROCESS"
    title="How it works"
    lede="Three steps. You approve the spend and read the numbers; we do the sourcing, the paperwork, and the payments."
  >
    <ol className="min-w-0 border-t border-border">
      {STEPS.map((step, i) => (
        <Reveal
          as="li"
          key={step.n}
          delay={i * 90}
          className="block min-w-0 border-b border-border"
        >
          <div className="grid grid-cols-12 items-start gap-x-6 py-10 md:gap-x-8 md:py-14">
            {/* Step gutter — index over kicker, both mono. */}
            <div className="col-span-12 mb-5 min-w-0 md:col-span-3 md:mb-0 lg:col-span-2">
              <div className="num text-[15px] font-medium leading-none text-foreground">
                {step.n}
              </div>
              <div className="row-label mt-2.5 flex items-center gap-2">
                {step.live && (
                  <span
                    aria-hidden="true"
                    className="inline-block h-[6px] w-[6px] shrink-0 bg-accent"
                  />
                )}
                <span>{step.kicker}</span>
              </div>
            </div>

            {/* The step. Wide type, left-aligned, one idea per row. */}
            <p className="col-span-12 min-w-0 max-w-[26ch] text-[clamp(1.25rem,2.6vw,2rem)] font-medium leading-[1.24] tracking-[-0.018em] md:col-span-9 lg:col-span-10 lg:max-w-[30ch]">
              {step.body}
            </p>
          </div>
        </Reveal>
      ))}
    </ol>
  </SectionShell>
);

export default Process;
