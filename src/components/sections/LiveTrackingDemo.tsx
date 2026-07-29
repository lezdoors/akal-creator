import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { SectionShell } from '@/components/SectionShell';
import { Reveal } from '@/components/Reveal';
import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';

/* ---------------------------------------------------------------------------
   Contract — GET /api/demo-clicks -> { clicks: [{ id, ts, country, referrer,
   device }] }. The endpoint is owned by another agent; everything here degrades
   to the empty state if it is missing, slow, or malformed. No error is ever
   rendered: a broken demo must look like a demo nobody has clicked yet.
--------------------------------------------------------------------------- */

export interface DemoClick {
  id: string | number;
  /** Epoch ms or an ISO-8601 string. Both are tolerated. */
  ts: string | number;
  country: string;
  referrer: string;
  device: string;
}

export interface DemoClicksResponse {
  clicks: DemoClick[];
}

const POLL_MS = 2000;
const MAX_ROWS = 12;
/** Ledger rows stagger at 60ms (REGISTER §Motion). The chain uses the same beat. */
const CHAIN_STAGGER_MS = 60;
/** Table rows land tighter than the chain — one wave, not twelve events. */
const ROW_STAGGER_MS = 40;

/** Narrow an unknown payload to the contract. Anything off-shape is dropped. */
function parseClicks(payload: unknown): DemoClick[] {
  if (typeof payload !== 'object' || payload === null) return [];
  const list: unknown = (payload as { clicks?: unknown }).clicks;
  if (!Array.isArray(list)) return [];

  const out: DemoClick[] = [];
  for (const item of list as unknown[]) {
    if (typeof item !== 'object' || item === null) continue;
    const row = item as Record<string, unknown>;
    const id = row.id;
    if (typeof id !== 'string' && typeof id !== 'number') continue;
    const ts = row.ts;
    out.push({
      id,
      ts: typeof ts === 'string' || typeof ts === 'number' ? ts : '',
      country: typeof row.country === 'string' ? row.country : '',
      referrer: typeof row.referrer === 'string' ? row.referrer : '',
      device: typeof row.device === 'string' ? row.device : '',
    });
  }
  return out;
}

/** Epoch ms / ISO string -> 24h clock. Falls back to the raw value. */
function formatTime(ts: string | number): string {
  const d = new Date(typeof ts === 'number' ? ts : Date.parse(String(ts)));
  if (Number.isNaN(d.getTime())) return String(ts || '--:--:--');
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function sortKey(ts: string | number): number {
  const n = typeof ts === 'number' ? ts : Date.parse(String(ts));
  return Number.isNaN(n) ? 0 : n;
}

const dash = (s: string, fallback = '—') => (s.trim() ? s.trim() : fallback);

/* --------------------------------------------------------------------------- */

/** The redirect chain, in order. Each step is what actually happens on the wire. */
const CHAIN: ReadonlyArray<{ step: string; gloss: string }> = [
  {
    step: 'creator link',
    gloss:
      'The creator posts one tracked URL in the description, the pinned comment, or the newsletter.',
  },
  {
    step: '302 redirect',
    gloss:
      'The link hits our edge, we write the click, and the viewer is handed straight to your page.',
  },
  {
    step: 'tracked click',
    gloss:
      'Timestamp, country, referrer and device are recorded against that placement and no other.',
  },
  {
    step: 'your postback',
    gloss:
      'When the visitor signs up, your server posts the click id back to us. No pixel, no cookie sync.',
  },
  {
    step: 'attributed signup',
    gloss:
      'The signup lands on that creator’s row in the ledger, next to what the placement cost.',
  },
];

export interface LiveTrackingDemoProps {
  /** Gutter index. The page owner sets the running order — see Index.tsx. */
  index?: string;
  /** Gutter label. */
  label?: string;
  /** Anchor id. */
  id?: string;
  /** Path of the demo redirect the visitor is invited to open. */
  linkPath?: string;
  /** Path polled for arriving clicks. Matches the agreed contract. */
  endpoint?: string;
}

/**
 * TRACKING — the demonstration.
 *
 * Left: the redirect chain as a mono sequence. Right: a real tracked link the
 * visitor can copy or open, and an append-only table that polls the clicks
 * endpoint every two seconds and shows their own click arriving, newest first.
 *
 * Polling runs only while the section is on screen (`useInView` with
 * `once: false`) and pauses with the tab. Motion is CSS `.animate-appear` on
 * mount of each new row, which the global reduced-motion block neutralises.
 */
export const LiveTrackingDemo: React.FC<LiveTrackingDemoProps> = ({
  index = '03',
  label = 'TRACKING',
  id = 'tracking',
  // The tracked redirect is /go/:code — vercel.json rewrites it to api/go.js,
  // and api/demo-clicks.js seeds the placement under the code `demo`.
  // (/api/r/... is not a route: /r/:token is the client report page.)
  linkPath = '/go/demo',
  endpoint = '/api/demo-clicks',
}) => {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.1 });
  const [clicks, setClicks] = useState<DemoClick[]>([]);
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  /* Increments once per COMPLETED poll attempt. It is the only thing driving
     the live mark below — see the note on the header strip. */
  const [pollTick, setPollTick] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  const href = origin ? `${origin}${linkPath}` : linkPath;
  const shown = origin ? href.replace(/^https?:\/\//, '') : linkPath;

  /* Poll while visible. Failures are swallowed — the empty state is the
     fallback, and a fetch error must never reach the page. */
  useEffect(() => {
    if (!inView) return;
    if (typeof window === 'undefined') return;

    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      try {
        const res = await fetch(endpoint, {
          signal: controller.signal,
          headers: { accept: 'application/json' },
          cache: 'no-store',
        });
        if (!res.ok) return;
        const parsed = parseClicks(await res.json());
        if (!cancelled) setClicks(parsed);
      } catch {
        /* offline, 404, aborted, or not JSON yet — keep the empty state. */
      } finally {
        /* Ticks on success AND on failure, because what the mark claims is
           "polling every 2s" — the ATTEMPT is the real event. It does not tick
           on the hidden-tab early return above, so the mark correctly goes
           still whenever we have actually stopped polling. */
        if (!cancelled) setPollTick((t) => t + 1);
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), POLL_MS);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(timer);
    };
  }, [inView, endpoint]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const copy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(href);
        setCopied(true);
        clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      /* clipboard denied — the link is on screen and selectable anyway. */
    }
  }, [href]);

  /** Newest first, capped. Defensive sort: never trust the server's order. */
  const rows = useMemo(
    () => [...clicks].sort((a, b) => sortKey(b.ts) - sortKey(a.ts)).slice(0, MAX_ROWS),
    [clicks],
  );

  /* The mono counter treatment, taken from the reference's metrics count-up:
     the figure travels to its new value and the digits resolve out of a blur
     as it settles. Structurally different in what it counts — the reference
     drove its counter next to a canvas sparkline of trigonometric fake
     telemetry under a LIVE badge, which is the fabricated-metric class we are
     forbidden. This counts the length of `rows` and nothing else, so with a
     dead endpoint it honestly reads 00. Under reduced motion useCountUp jumps
     straight to target, so the blur never gets a frame. */
  const counted = useCountUp(rows.length, 500);
  const countLabel = String(Math.round(counted)).padStart(2, '0');
  const settling = Math.abs(counted - rows.length) > 0.01;

  return (
    <SectionShell
      id={id}
      index={index}
      label={label}
      title="Watch a click become attribution."
      lede="This is the tracking service, running. Open the link below and your own click lands in the table in about two seconds — the same path every creator placement takes."
    >
      {/* Reference slot (metrics-section:273): a full-content-width art band
          between the headline and the working panel, full strength, NO overlay,
          the content butting straight against its lower edge (-mb rule shared).
          ref-graph was pulled here: green/multicolour, a direct palette drift
          in a magenta+amber system — the exact failure the register names. The
          on-palette field frame holds the slot until the HF 3:1 band lands. */}
      <div aria-hidden className="relative w-full overflow-hidden mb-0 border border-border border-b-0">
        <img
          src="/images/mo-crossing.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="block w-full h-auto object-cover max-h-[300px]"
        />
      </div>
      <div ref={ref} className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-12 min-w-0 border-t border-border pt-10">
        {/* ---------------------------------------------------------------
            Left — the chain.
        --------------------------------------------------------------- */}
        <div className="lg:col-span-5 min-w-0">
          <Reveal as="div" className="row-label">
            The chain
          </Reveal>

          {/* The reference drove its equivalent step list off a 6s auto-advance
              that overwrote any manual choice and kept stepping in a hidden
              tab. Deliberately not ported: this is a five-step explanation, it
              wants to be read at the reader's pace, and a page selling
              operational control should not fight the person operating it.
              Every state below is hover-driven and purely emphatic — no step
              hides information that another step reveals. */}
          <ol className="mt-6 border-t border-border min-w-0">
            {CHAIN.map((link, i) => (
              <Reveal
                as="li"
                key={link.step}
                delay={i * CHAIN_STAGGER_MS}
                className="group relative border-b border-border py-4 min-w-0"
              >
                <div className="flex items-baseline gap-3 min-w-0">
                  <span
                    className="num text-[11px] text-muted-foreground shrink-0 w-[2.4rem]
                               transition-colors duration-300 group-hover:text-foreground"
                  >
                    {i === 0 ? '  ' : '->'} {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="num text-[13px] md:text-sm text-foreground min-w-0 break-words">
                    {link.step}
                  </span>
                </div>
                <p
                  className="mt-2 pl-[3.15rem] text-[13.5px] leading-relaxed text-muted-foreground max-w-[46ch]
                             transition-colors duration-300 group-hover:text-foreground"
                >
                  {link.gloss}
                </p>
                {/* Active rule wiping in from the left. scaleX + origin-left so
                    it is compositor-only — the reference implemented this same
                    idea twice, once with transform and once by animating
                    `width`; this is the transform one. 500ms against the copy's
                    300ms, so the content commits before the frame does.
                    Reveal sets animationDelay and never transitionDelay, so the
                    entrance stagger cannot leak into these hover transitions and
                    make the lower rows feel dead to the cursor — the bug the
                    reference shipped on three separate grids. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-px left-0 right-0 h-px origin-left scale-x-0
                             bg-foreground transition-transform duration-500 group-hover:scale-x-100"
                />
              </Reveal>
            ))}
          </ol>

          <Reveal
            as="p"
            delay={CHAIN.length * CHAIN_STAGGER_MS + 80}
            className="mt-6 text-[13.5px] leading-relaxed text-muted-foreground max-w-[46ch]"
          >
            {/* Accuracy: api/go.js DOES set one first-party cookie (akal_ref),
                and PrivacyPage discloses it. Claiming "no cookies" here would
                contradict both our own code and our own privacy notice. */}
            No third-party cookies, no fingerprinting, no cross-site pixel. One
            first-party cookie, a click id in the URL, and a postback from your
            own backend — the same mechanism your affiliate stack already speaks.
          </Reveal>
        </div>

        {/* ---------------------------------------------------------------
            Right — the working demo.
        --------------------------------------------------------------- */}
        <div className="lg:col-span-7 min-w-0">
          <Reveal as="div" delay={120} className="border border-border bg-background min-w-0">
            {/* Link + controls */}
            <div className="p-5 md:p-6 border-b border-border min-w-0">
              <div className="row-label">Tracked link</div>

              <div className="mt-3 border border-border bg-secondary/50 px-3 py-2.5 min-w-0">
                <code className="block text-[12.5px] md:text-[13px] leading-relaxed break-all text-foreground">
                  {shown}
                </code>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 min-w-0">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="num group inline-flex items-center bg-accent px-4 py-2.5 text-[12px] uppercase
                             tracking-[0.12em] text-accent-foreground transition-opacity hover:opacity-90
                             focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2
                             focus-visible:outline-accent"
                >
                  Open the link
                  {/* The reference's arrow nudge, at 300ms rather than the
                      inherited 150ms default that made theirs snap. */}
                  <span
                    aria-hidden="true"
                    className="ml-2 inline-block transition-transform duration-300
                               group-hover:translate-x-1 group-focus-visible:translate-x-1"
                  >
                    &rarr;
                  </span>
                </a>

                <button
                  type="button"
                  onClick={() => void copy()}
                  aria-live="polite"
                  className="num inline-flex items-center border border-border px-4 py-2.5 text-[12px]
                             uppercase tracking-[0.12em] text-foreground transition-colors
                             hover:bg-secondary focus-visible:outline focus-visible:outline-1
                             focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>

                <span className="num text-[11px] text-muted-foreground">
                  opens in a new tab
                </span>
              </div>
            </div>

            {/* ---------------------------------------------------------------
                Table header strip — the live mark.

                The reference paired a free-running `animate-pulse` dot with a
                wall clock and a canvas sparkline. Two of those three are lies
                by construction: a dot that pulses on a 2s CSS loop keeps
                beating with the endpoint dead, and the sparkline plotted
                sin*cos noise dressed as telemetry. So this is the structurally
                different version — the mark is driven by `pollTick`, which only
                advances when a poll actually completes. Remounting on the key
                replays the CSS entrance from frame 0 with no class toggle and
                no reflow (the cleanest trick in the reference). Consequences,
                all of them wanted: endpoint down, tab hidden or section
                scrolled away and the sweep stops, because we have genuinely
                stopped polling. Nothing here animates on a timer of its own.
            --------------------------------------------------------------- */}
            <div className="relative flex items-center justify-between gap-4 px-5 md:px-6 py-3 border-b border-border min-w-0">
              <div className="row-label flex items-center gap-2 min-w-0">
                <span
                  aria-hidden="true"
                  className={cn(
                    'block h-[6px] w-[6px] shrink-0',
                    inView ? 'bg-accent' : 'bg-border',
                  )}
                />
                <span className="truncate">
                  Incoming clicks · polling every 2s
                </span>
              </div>

              {/* Mono counter: travels to the new value, digits resolving out
                  of a blur as it settles. Commas are never blurred in the
                  reference because that reads as a render fault; we are two
                  digits wide and have none. */}
              <span
                className={cn(
                  'num text-[11px] shrink-0 transition-[filter,color] duration-150',
                  settling ? 'blur-[0.6px] text-foreground' : 'text-muted-foreground',
                )}
              >
                {countLabel}
              </span>

              {/* Cadence sweep along the strip's own hairline. scaleX from
                  origin-left, so it composites. `.animate-progress` is the
                  house class and the reduced-motion block already pins it to
                  scaleX(1) — a static accent rule, which still reads correctly
                  as "this strip is the live one". */}
              {inView && (
                <span
                  key={pollTick}
                  aria-hidden="true"
                  className="animate-progress pointer-events-none absolute -bottom-px left-0 right-0 h-px bg-accent"
                  style={{ ['--dwell' as string]: `${POLL_MS}ms` } as React.CSSProperties}
                />
              )}
            </div>

            {/* Append-only table */}
            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-sm min-w-[440px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="row-label text-left font-normal py-2.5 pl-5 md:pl-6 pr-3">Time</th>
                    <th className="row-label text-left font-normal py-2.5 px-3">Country</th>
                    <th className="row-label text-left font-normal py-2.5 px-3">Referrer</th>
                    <th className="row-label text-left font-normal py-2.5 pl-3 pr-5 md:pr-6">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-10 pl-5 md:pl-6 pr-5 text-[13.5px] text-muted-foreground"
                      >
                        No clicks yet. Open the link above.
                      </td>
                    </tr>
                  ) : (
                    /* Keyed on the click id, so a poll that returns the same
                       rows does not remount them — only genuinely new rows
                       animate, and the stagger below therefore only ever runs
                       on the first populated paint. A row arriving later lands
                       at index 0 with delay 0, which is what an append-only
                       ledger should feel like: immediate, not queued.
                       animationDelay (not transitionDelay) so it cannot leak
                       into the row's hover transition. */
                    rows.map((click, i) => (
                      <tr
                        key={String(click.id)}
                        style={{ animationDelay: `${i * ROW_STAGGER_MS}ms` }}
                        className="border-b border-border animate-appear transition-colors duration-200
                                   hover:bg-secondary/60"
                      >
                        <td className="num py-3 pl-5 md:pl-6 pr-3 text-foreground whitespace-nowrap">
                          {formatTime(click.ts)}
                        </td>
                        <td className="num py-3 px-3 text-muted-foreground uppercase whitespace-nowrap">
                          {dash(click.country, '??')}
                        </td>
                        <td className="num py-3 px-3 text-muted-foreground max-w-[14rem] truncate">
                          {dash(click.referrer, 'direct')}
                        </td>
                        <td className="num py-3 pl-3 pr-5 md:pr-6 text-muted-foreground whitespace-nowrap">
                          {dash(click.device)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 md:px-6 py-4 border-t border-border bg-secondary/60">
              {/* Says what the endpoint actually does. api/demo-clicks.js reads
                  the last 8 rows on the shared `demo` placement with no
                  per-visitor filter, and db/schema.sql declares clicks
                  append-only with no cleanup job — so neither "your own clicks
                  only" nor "cleared periodically" is a claim we can make. */}
              <p className="row-label !text-foreground">
                Live demo endpoint · the last 8 clicks on this shared demo link
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
};

export default LiveTrackingDemo;
