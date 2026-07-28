import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { SectionShell } from '@/components/SectionShell';
import { Reveal } from '@/components/Reveal';
import { useInView } from '@/hooks/useInView';

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
  /** Gutter index. The page owner sets the running order. Default '03'. */
  index?: string;
  /** Gutter label. Default 'TRACKING'. */
  label?: string;
  /** Anchor id. */
  id?: string;
  /** Path of the demo redirect the visitor is invited to open. */
  linkPath?: string;
  /** Path polled for arriving clicks. Matches the agreed contract. */
  endpoint?: string;
}

/**
 * Section 03 — the tracking demonstration.
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

  return (
    <SectionShell
      id={id}
      index={index}
      label={label}
      title="Watch a click become attribution."
      lede="This is the tracking service, running. Open the link below and your own click lands in the table in about two seconds — the same path every creator placement takes."
    >
      <div ref={ref} className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-12 min-w-0">
        {/* ---------------------------------------------------------------
            Left — the chain.
        --------------------------------------------------------------- */}
        <div className="lg:col-span-5 min-w-0">
          <Reveal as="div" className="row-label">
            The chain
          </Reveal>

          <ol className="mt-6 border-t border-border min-w-0">
            {CHAIN.map((link, i) => (
              <Reveal
                as="li"
                key={link.step}
                delay={i * 60}
                className="border-b border-border py-4 min-w-0"
              >
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="num text-[11px] text-muted-foreground shrink-0 w-[2.4rem]">
                    {i === 0 ? '  ' : '->'} {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="num text-[13px] md:text-sm text-foreground min-w-0 break-words">
                    {link.step}
                  </span>
                </div>
                <p className="mt-2 pl-[3.15rem] text-[13.5px] leading-relaxed text-muted-foreground max-w-[46ch]">
                  {link.gloss}
                </p>
              </Reveal>
            ))}
          </ol>

          <p className="mt-6 text-[13.5px] leading-relaxed text-muted-foreground max-w-[46ch]">
            No cookies, no fingerprinting, no cross-site pixel. A click id in the
            URL and a postback from your own backend — the same mechanism your
            affiliate stack already speaks.
          </p>
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
                  className="num inline-flex items-center bg-accent px-4 py-2.5 text-[12px] uppercase
                             tracking-[0.12em] text-accent-foreground transition-opacity hover:opacity-90
                             focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2
                             focus-visible:outline-accent"
                >
                  Open the link
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

            {/* Table header strip */}
            <div className="flex items-center justify-between gap-4 px-5 md:px-6 py-3 border-b border-border min-w-0">
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
              <span className="num text-[11px] text-muted-foreground shrink-0">
                {String(rows.length).padStart(2, '0')}
              </span>
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
                    rows.map((click) => (
                      <tr key={String(click.id)} className="border-b border-border animate-appear">
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
