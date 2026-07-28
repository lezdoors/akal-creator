/**
 * Attribution ledger model.
 *
 * Powers the hero. Pure functions, no React — the arithmetic has to be
 * auditable, because the entire pitch is "we can tell you what a placement is
 * actually worth."
 *
 * IMPORTANT: every creator below is a ROLE DESCRIPTOR, not a real person or
 * channel. The hero renders an explicit "illustrative figures" label. Real
 * handles and real numbers only ever appear on a client's own /r/:token report,
 * never on the marketing site.
 */

export interface Creator {
  /** Role descriptor. Never a real handle. */
  role: string;
  platform: 'YouTube' | 'Newsletter' | 'Podcast' | 'X';
  /** Audience size. */
  audience: number;
  /** Median views on recent posts — the number that actually predicts delivery. */
  medianViews: number;
  /** What they charge per 1,000 delivered views, in cents. */
  cpmAskCents: number;
  /** Share of viewers who click the tracked link. */
  ctr: number;
  /** Share of clickers who sign up. */
  cvr: number;
}

export interface LedgerRow extends Creator {
  feeCents: number;
  clicks: number;
  signups: number;
  cpaCents: number;
  /** Did this placement clear the target CPA and fit inside the budget? */
  bought: boolean;
}

export interface LedgerTotals {
  spendCents: number;
  budgetCents: number;
  clicks: number;
  signups: number;
  blendedCpaCents: number;
  bought: number;
  considered: number;
}

/**
 * Illustrative pool. Dev-tools / B2B SaaS creator economics.
 *
 * Sized so the budget control stays meaningful across its whole range — the
 * pool totals roughly $34k, so dragging budget genuinely changes which
 * placements clear. A pool cheaper than the max budget would make the slider
 * dead above a certain point, which reads as "can't spend your money."
 */
export const CREATORS: Creator[] = [
  { role: 'Staff-engineer letter',    platform: 'Newsletter', audience:  18_000, medianViews:  13_500, cpmAskCents: 5_200, ctr: 0.031, cvr: 0.094 },
  { role: 'Indie-hacker podcast',     platform: 'Podcast',    audience:  29_000, medianViews:   9_500, cpmAskCents: 4_100, ctr: 0.021, cvr: 0.081 },
  { role: 'Dev-tools reviewer',       platform: 'YouTube',    audience:  84_000, medianViews:  22_000, cpmAskCents: 2_800, ctr: 0.018, cvr: 0.062 },
  { role: 'AI newsletter',            platform: 'Newsletter', audience:  46_000, medianViews:  31_000, cpmAskCents: 3_400, ctr: 0.024, cvr: 0.048 },
  { role: 'Backend deep-dive',        platform: 'YouTube',    audience:  57_000, medianViews:  14_000, cpmAskCents: 3_100, ctr: 0.016, cvr: 0.058 },
  { role: 'DevOps walkthrough',       platform: 'YouTube',    audience: 121_000, medianViews:  38_000, cpmAskCents: 2_600, ctr: 0.014, cvr: 0.052 },
  { role: 'Data-engineering digest',  platform: 'Newsletter', audience:  62_000, medianViews:  44_000, cpmAskCents: 2_900, ctr: 0.019, cvr: 0.044 },
  { role: 'Security-research channel',platform: 'YouTube',    audience:  95_000, medianViews:  27_000, cpmAskCents: 3_300, ctr: 0.015, cvr: 0.049 },
  { role: 'Founder interview show',   platform: 'Podcast',    audience:  74_000, medianViews:  21_000, cpmAskCents: 3_800, ctr: 0.012, cvr: 0.055 },
  { role: 'Terminal-workflow short',  platform: 'YouTube',    audience: 210_000, medianViews:  64_000, cpmAskCents: 2_100, ctr: 0.009, cvr: 0.041 },
  { role: 'Framework tutorial',       platform: 'YouTube',    audience: 340_000, medianViews:  41_000, cpmAskCents: 2_400, ctr: 0.007, cvr: 0.033 },
  { role: 'Systems-design series',    platform: 'YouTube',    audience: 168_000, medianViews:  52_000, cpmAskCents: 2_500, ctr: 0.008, cvr: 0.036 },
  { role: 'Build-in-public thread',   platform: 'X',          audience: 132_000, medianViews:  88_000, cpmAskCents:   900, ctr: 0.004, cvr: 0.022 },
  { role: 'Tech-news roundup',        platform: 'X',          audience: 410_000, medianViews: 240_000, cpmAskCents:   700, ctr: 0.002, cvr: 0.014 },
];

const priceOf = (c: Creator) => Math.round((c.medianViews / 1000) * c.cpmAskCents);

/**
 * Allocate a budget across the pool.
 *
 * Rank by cost-per-acquisition, drop anything that misses the target CPA, then
 * buy down the list until the budget runs out. This is deliberately the same
 * logic a paid-media buyer would apply — that's the point of the demonstration.
 */
export function buildLedger(budgetCents: number, targetCpaCents: number): {
  rows: LedgerRow[];
  totals: LedgerTotals;
} {
  const priced = CREATORS.map((c): LedgerRow => {
    const feeCents = priceOf(c);
    const clicks = Math.round(c.medianViews * c.ctr);
    const signups = Math.round(clicks * c.cvr);
    return {
      ...c,
      feeCents,
      clicks,
      signups,
      cpaCents: signups > 0 ? Math.round(feeCents / signups) : Number.POSITIVE_INFINITY,
      bought: false,
    };
  });

  const ranked = [...priced].sort((a, b) => a.cpaCents - b.cpaCents);

  let spent = 0;
  for (const row of ranked) {
    if (row.cpaCents > targetCpaCents) continue;
    if (spent + row.feeCents > budgetCents) continue;
    row.bought = true;
    spent += row.feeCents;
  }

  const bought = ranked.filter((r) => r.bought);
  const clicks = bought.reduce((n, r) => n + r.clicks, 0);
  const signups = bought.reduce((n, r) => n + r.signups, 0);

  return {
    rows: ranked,
    totals: {
      spendCents: spent,
      budgetCents,
      clicks,
      signups,
      blendedCpaCents: signups > 0 ? Math.round(spent / signups) : 0,
      bought: bought.length,
      considered: ranked.length,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Formatters — every figure on the site goes through one of these.            */
/* -------------------------------------------------------------------------- */

export const usd = (cents: number, opts: { decimals?: boolean } = {}) =>
  `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  })}`;

export const compact = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`
      : `${n}`;

export const pct = (n: number, decimals = 1) => `${(n * 100).toFixed(decimals)}%`;
