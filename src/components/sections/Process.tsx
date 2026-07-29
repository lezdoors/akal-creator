import React, { useEffect, useRef, useState } from 'react';
import { SectionShell } from '@/components/SectionShell';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

/**
 * 02 / PROCESS — "How it works".
 *
 * Three numbered cards that advance on a dwell timer. Motion recipe ported from
 * the compute-11 reference: the active card lifts its border, puts the numeral
 * in accent, sweeps a rule across its head for the dwell, and carries a solid
 * accent bar on its bottom edge. Everything else sits muted.
 *
 * Three deliberate departures from that reference:
 *  - The timer runs only while the section is on screen. Theirs cycles forever
 *    in a background tab — wasted work and a battery cost.
 *  - Advancing pauses on hover and on keyboard focus, so it cannot pull a card
 *    out from under someone mid-sentence.
 *  - Cards are real buttons in a tablist and arrow-key navigable. Auto-rotating
 *    content with no keyboard path is an accessibility trap.
 */

const DWELL_MS = 6000;

interface Step {
  n: string;
  title: string;
  kicker: string;
  body: string;
}

const STEPS: readonly Step[] = [
  {
    n: '01',
    title: 'Define',
    kicker: 'the audience and the number',
    body: 'You give us who you sell to, what you can spend, and the metric that decides whether it worked — usually a signup, a trial, or a booked demo.',
  },
  {
    n: '02',
    title: 'Approve',
    kicker: 'the shortlist',
    body: 'We source, vet on median recent views rather than subscriber counts, and price each placement on a CPM basis. You see the list and the arithmetic before anything is booked.',
  },
  {
    n: '03',
    title: 'Watch',
    kicker: 'the dashboard',
    body: 'We handle contracts, briefs and creator payments. Every placement carries a tracked link, so clicks, signups and CPA land per creator as they happen.',
  },
];

export const Process: React.FC = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.25 });
  const btns = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!inView || paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % STEPS.length),
      DWELL_MS,
    );
    return () => window.clearInterval(id);
  }, [inView, paused]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (active + delta + STEPS.length) % STEPS.length;
    setActive(next);
    btns.current[next]?.focus();
  };

  return (
    <SectionShell
      id="how-it-works"
      index="02"
      label="PROCESS"
      title="Three steps. You approve one of them."
      lede="The other two are ours. You are never asked to chase a creator, chase an invoice, or take our word for a number."
    >
      {/* gap-px over a border-coloured ground draws the dividers, so adjacent
          cards share one hairline instead of stacking two. */}
      <div
        ref={ref}
        role="tablist"
        aria-label="How it works"
        onKeyDown={onKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border min-w-0"
      >
        {STEPS.map((step, i) => {
          const on = active === i;
          return (
            <button
              key={step.n}
              ref={(el) => {
                btns.current[i] = el;
              }}
              role="tab"
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                'relative text-left p-7 lg:p-9 min-w-0 bg-background outline-none',
                'transition-colors duration-500',
                'focus-visible:ring-1 focus-visible:ring-accent',
                on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80',
              )}
            >
              <div className="flex items-center gap-4 mb-7">
                <span
                  className={cn(
                    'num text-3xl leading-none transition-colors duration-300',
                    on ? 'text-accent' : 'text-muted-foreground/40',
                  )}
                >
                  {step.n}
                </span>
                <span className="flex-1 h-px bg-border overflow-hidden">
                  {on && (
                    // keyed on `active` so the sweep restarts each time
                    <span
                      key={active}
                      className="block h-full bg-accent/60 animate-progress"
                      style={{ ['--dwell' as string]: `${DWELL_MS}ms` }}
                    />
                  )}
                </span>
              </div>

              <h3 className="text-2xl lg:text-3xl text-foreground mb-1 tracking-tight">
                {step.title}
              </h3>
              <span className="block text-lg text-muted-foreground mb-5">{step.kicker}</span>

              <p
                className={cn(
                  'text-[15px] leading-relaxed transition-opacity duration-300',
                  on ? 'opacity-100' : 'opacity-60',
                )}
              >
                {step.body}
              </p>

              <span
                aria-hidden
                className={cn(
                  'absolute bottom-0 left-0 right-0 h-[3px] bg-accent origin-left',
                  'transition-transform duration-500',
                  on ? 'scale-x-100' : 'scale-x-0',
                )}
              />
            </button>
          );
        })}
      </div>
    </SectionShell>
  );
};
