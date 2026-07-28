import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usd, compact } from '@/lib/ledger';

/**
 * /r/:token — the client's own campaign report.
 *
 * Read-only, no login: campaigns.report_token is unguessable (db/schema.sql).
 *
 * Same ledger grammar as the hero's AttributionLedger, with one deliberate
 * difference: these are REAL numbers from a real campaign, so this page must
 * NOT carry the "illustrative figures" provenance label. That label belongs to
 * the marketing example only, and putting it here would misdescribe live data.
 */

interface Placement {
  id: string;
  code: string;
  creator: { handle: string; platform: string; audienceSize: number | null };
  liveAt: string | null;
  feeCents: number;
  deliveredViews: number | null;
  clicks: number;
  conversions: number;
  valueCents: number;
  cpmCents: number | null;
  cpcCents: number | null;
  cpaCents: number | null;
  lastEventAt: string | null;
}

interface Report {
  client: { name: string };
  campaign: {
    name: string;
    status: string;
    currency: string;
    budgetCents: number;
    targetCpaCents: number | null;
    createdAt: string;
    startsAt: string | null;
    endsAt: string | null;
  };
  placements: Placement[];
  totals: {
    placements: number;
    feeCents: number;
    clicks: number;
    conversions: number;
    valueCents: number;
    deliveredViews: number | null;
    cpmCents: number | null;
    cpcCents: number | null;
    cpaCents: number | null;
  };
  generatedAt: string;
}

/* -------------------------------------------------------------------------- */
/* Formatting — an unknown figure is a rule-width em dash, never a zero.       */
/* -------------------------------------------------------------------------- */

const DASH = '—';

const money = (cents: number | null, decimals = false) =>
  cents === null || cents === undefined ? DASH : usd(cents, { decimals });

const count = (n: number | null) =>
  n === null || n === undefined ? DASH : n.toLocaleString('en-US');

const day = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : null;

/** Row sub-line date. Year dropped so the placement cell fits at 390px. */
const dayShort = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        timeZone: 'UTC',
      })
    : null;

const clock = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      })
    : null;

/* -------------------------------------------------------------------------- */
/* Chrome                                                                      */
/* -------------------------------------------------------------------------- */

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <main className="min-h-screen bg-background text-foreground">
    <div className="mx-auto w-full max-w-[1120px] px-5 md:px-8 py-10 md:py-16">
      {children}
    </div>
  </main>
);

const Bar: React.FC<{ w: string; h?: string }> = ({ w, h = 'h-3' }) => (
  <div className={`${h} ${w} max-w-full bg-border/70`} />
);

const Skeleton: React.FC = () => (
  <Shell>
    <div className="animate-pulse">
      <Bar w="w-[120px]" h="h-2.5" />
      <div className="mt-5 space-y-3">
        <Bar w="w-[340px]" h="h-7" />
        <Bar w="w-[220px]" h="h-3" />
      </div>
      <div className="mt-10 border-t border-border">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border py-4 min-w-0"
          >
            <div className="flex-1 min-w-0">
              <Bar w="w-[180px]" />
            </div>
            <Bar w="w-[64px]" />
            <Bar w="w-[52px]" />
            <Bar w="w-[52px]" />
          </div>
        ))}
      </div>
    </div>
  </Shell>
);

const Invalid: React.FC = () => (
  <Shell>
    <p className="row-label">AKAL · Campaign report</p>
    <h1 className="mt-5 text-2xl md:text-3xl font-medium tracking-tight">
      This report link isn&rsquo;t valid.
    </h1>
    <p className="mt-4 max-w-[46ch] text-sm text-muted-foreground">
      The link may have been retyped, truncated by an email client, or the
      campaign it pointed at may have been closed. Ask your AKAL contact to
      re-send it.
    </p>
    <div className="rule mt-8 pt-4">
      <p className="row-label">Akal Digital Services Ltd · England &amp; Wales 17229387</p>
    </div>
  </Shell>
);

/* -------------------------------------------------------------------------- */
/* Ledger row                                                                  */
/* -------------------------------------------------------------------------- */

/* Column padding, shared by header and body so the numeric axis holds. */
const CELL = 'py-3 px-2 sm:px-3';
const FIRST = 'py-3 pl-4 pr-2 sm:pr-3';
const LAST = 'py-3 pl-2 sm:pl-3 pr-4';

const Row: React.FC<{ p: Placement; index: number; targetCpaCents: number | null }> = ({
  p,
  index,
  targetCpaCents,
}) => {
  // positive/negative are for deltas only, so only the exception is marked:
  // a placement that missed the agreed target CPA. Everything on plan stays
  // ink, which keeps the page from turning into a wall of green.
  const missesTarget =
    targetCpaCents !== null && p.cpaCents !== null && p.cpaCents > targetCpaCents;

  return (
    <tr
      className="rule animate-appear"
      style={{ animationDelay: `${120 + index * 60}ms` }}
    >
      <td className={`${FIRST} align-top`}>
        <span className="num text-foreground">{p.creator.handle}</span>
        <span className="num block text-[11px] text-muted-foreground mt-0.5">
          {p.creator.platform}
          {p.creator.audienceSize ? ` · ${compact(p.creator.audienceSize)}` : ''}
          {/* Live date is the first thing to go at 390px — keeping it wraps the
              sub-line and makes every row two lines tall. */}
          <span className="hidden sm:inline">
            {p.liveAt ? ` · live ${dayShort(p.liveAt)}` : ' · not live'}
          </span>
        </span>
      </td>
      <td className={`col-num ${CELL} text-muted-foreground hidden xl:table-cell`}>
        {p.deliveredViews === null ? DASH : compact(p.deliveredViews)}
      </td>
      <td className={`col-num ${CELL}`}>{money(p.feeCents)}</td>
      <td className={`col-num ${CELL} text-muted-foreground hidden md:table-cell`}>
        {money(p.cpmCents, true)}
      </td>
      <td className={`col-num ${CELL} hidden sm:table-cell`}>{count(p.clicks)}</td>
      <td className={`col-num ${CELL} text-muted-foreground hidden lg:table-cell`}>
        {money(p.cpcCents, true)}
      </td>
      <td className={`col-num ${CELL}`}>{count(p.conversions)}</td>
      <td className={`col-num ${LAST} font-medium ${missesTarget ? 'text-negative' : ''}`}>
        {money(p.cpaCents)}
      </td>
    </tr>
  );
};

const Total: React.FC<{ label: string; children: React.ReactNode; sub?: string }> = ({
  label,
  children,
  sub,
}) => (
  <div className="min-w-0">
    <div className="row-label mb-1">{label}</div>
    <span className="num text-xl font-medium">{children}</span>
    {sub && <span className="num text-[11px] text-muted-foreground ml-1.5">{sub}</span>}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export const ReportPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'invalid'>('loading');

  const load = useCallback(async () => {
    if (!token) {
      setState('invalid');
      return;
    }
    try {
      const r = await fetch(`/api/report?token=${encodeURIComponent(token)}`, {
        headers: { Accept: 'application/json' },
      });
      if (!r.ok) {
        // A 404 means the token is genuinely not a report. Anything else is a
        // transient server or network fault — never tear down a report the
        // client is already reading because one poll missed.
        setState((prev) =>
          r.status === 404 ? 'invalid' : prev === 'ready' ? 'ready' : 'invalid',
        );
        return;
      }
      setReport((await r.json()) as Report);
      setState('ready');
    } catch {
      setState((prev) => (prev === 'ready' ? 'ready' : 'invalid'));
    }
  }, [token]);

  useEffect(() => {
    void load();
    // "Live" has to mean live. Cheap poll, read-only, no websocket to babysit.
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    document.title = report
      ? `${report.campaign.name} · ${report.client.name} · AKAL`
      : 'Campaign report · AKAL';

    // A token in the URL is the credential. Never let a crawler hold it.
    // Injected imperatively rather than via Helmet, and torn down on unmount so
    // a client-side nav back to the marketing page does not leave it noindexed.
    const tag = document.createElement('meta');
    tag.name = 'robots';
    tag.content = 'noindex, nofollow';
    tag.dataset.reportRobots = 'true';
    document.head.appendChild(tag);
    return () => {
      tag.remove();
    };
  }, [report]);

  if (state === 'loading') return <Skeleton />;
  if (state === 'invalid' || !report) return <Invalid />;

  const { client, campaign, placements, totals, generatedAt } = report;
  const from = day(campaign.startsAt) || day(campaign.createdAt);
  const to = day(campaign.endsAt);
  const underTarget =
    campaign.targetCpaCents !== null &&
    totals.cpaCents !== null &&
    totals.cpaCents <= campaign.targetCpaCents;
  const spendPct =
    campaign.budgetCents > 0
      ? Math.round((totals.feeCents / campaign.budgetCents) * 100)
      : null;

  return (
    <Shell>
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="min-w-0">
          <p className="row-label">{client.name} · Campaign report</p>
          <h1 className="mt-3 text-2xl md:text-4xl font-medium tracking-tight break-words">
            {campaign.name}
          </h1>
          <p className="num mt-3 text-[12px] text-muted-foreground">
            {from} {to ? `→ ${to}` : '→ in flight'} · {campaign.currency} ·{' '}
            {campaign.status}
          </p>
        </div>

        {/* The one accent on this page: the live-data mark. */}
        <div className="min-w-0">
          <span className="num inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-accent">
            <span className="h-1.5 w-1.5 bg-accent" aria-hidden="true" />
            Live
          </span>
          <span className="num block text-[11px] text-muted-foreground mt-1">
            updated {clock(generatedAt)} UTC
          </span>
        </div>
      </header>

      {/* Ledger */}
      {/* Edge to edge on mobile: the hairline box keeps its rules but gives the
          numeric columns the full 390px. */}
      <section className="mt-8 md:mt-12 -mx-5 md:mx-0 border-y md:border border-border">
        <div className="overflow-x-auto">
          {/* Columns shed from the outside in so Fee / Signups / CPA — the three
              a client actually opens this for — fit natively at 390px rather
              than sitting off the edge of a scroller. */}
          <table className="w-full text-sm sm:min-w-[560px] lg:min-w-[720px]">
            <thead>
              <tr className="border-b border-border">
                <th className={`row-label text-left font-normal ${FIRST} !py-2.5`}>
                  Placement
                </th>
                <th className={`row-label text-right font-normal ${CELL} !py-2.5 hidden xl:table-cell`}>
                  Views
                </th>
                <th className={`row-label text-right font-normal ${CELL} !py-2.5`}>Fee</th>
                <th className={`row-label text-right font-normal ${CELL} !py-2.5 hidden md:table-cell`}>
                  CPM
                </th>
                <th className={`row-label text-right font-normal ${CELL} !py-2.5 hidden sm:table-cell`}>
                  Clicks
                </th>
                <th className={`row-label text-right font-normal ${CELL} !py-2.5 hidden lg:table-cell`}>
                  CPC
                </th>
                <th className={`row-label text-right font-normal ${CELL} !py-2.5`}>
                  Signups
                </th>
                <th className={`row-label text-right font-normal ${LAST} !py-2.5`}>
                  CPA
                </th>
              </tr>
            </thead>
            <tbody>
              {placements.map((p, i) => (
                <Row
                  key={p.id}
                  p={p}
                  index={i}
                  targetCpaCents={campaign.targetCpaCents}
                />
              ))}
              {placements.length === 0 && (
                <tr className="rule">
                  <td colSpan={8} className="row-label py-4 pl-4">
                    No placements live yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-border bg-secondary/60 px-4 md:px-6 py-4">
          <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
            <Total
              label="Spend"
              sub={
                campaign.budgetCents > 0
                  ? `of ${usd(campaign.budgetCents)}${spendPct !== null ? ` · ${spendPct}%` : ''}`
                  : undefined
              }
            >
              {money(totals.feeCents)}
            </Total>
            <Total label="Placements">{count(totals.placements)}</Total>
            <Total label="Clicks">{count(totals.clicks)}</Total>
            <Total label="Signups">{count(totals.conversions)}</Total>
            <div className="min-w-0">
              <div className="row-label mb-1">Blended CPA</div>
              <span
                className={`num text-xl font-medium ${
                  campaign.targetCpaCents === null
                    ? ''
                    : underTarget
                      ? 'text-positive'
                      : 'text-negative'
                }`}
              >
                {money(totals.cpaCents)}
              </span>
              {campaign.targetCpaCents !== null && (
                <span className="num text-[11px] text-muted-foreground ml-1.5">
                  target {usd(campaign.targetCpaCents)}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Method note. No provenance disclaimer here — this is real client data,
          and the hero's "illustrative figures" label would misdescribe it. */}
      <div className="mt-6 flex flex-wrap gap-x-10 gap-y-2">
        <p className="row-label min-w-0">Tracked links · signups de-duplicated</p>
        <p className="row-label min-w-0">CPM where views are reported</p>
      </div>

      <div className="rule mt-8 pt-4">
        <p className="row-label">
          Akal Digital Services Ltd · England &amp; Wales 17229387
        </p>
      </div>
    </Shell>
  );
};

export default ReportPage;
