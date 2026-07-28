// GET /api/report?token=<report_token>
//
// The client-facing campaign report behind /r/:token. campaigns.report_token is
// 16 random bytes of hex (db/schema.sql), so v1 needs no login — the token IS
// the credential. Two consequences, both load-bearing:
//
//   1. Every failure path returns the SAME generic 404 body. A malformed token,
//      an unknown token and a token for a deleted campaign are indistinguishable
//      from outside, so the endpoint cannot be used to enumerate valid tokens.
//   2. Never cached by a shared cache, never indexed.
//
import { query, isConfigured } from '../src/lib/db.js';

// Timestamps are formatted to ISO-8601 UTC in SQL rather than handed to the
// driver's date parsing: the client renders them, and a text column can't be
// re-interpreted in the browser's local zone by accident.
const ISO = `'YYYY-MM-DD"T"HH24:MI:SS"Z"'`;
const utc = (col, alias) =>
  `to_char(${col} AT TIME ZONE 'UTC', ${ISO}) AS ${alias}`;

const num = (v) => (v === null || v === undefined ? null : Number(v));
const int = (v) => (v === null || v === undefined ? 0 : Number(v));

/** Cost per unit in cents, or null when the denominator is unknown/zero. */
const per = (feeCents, units, multiplier = 1) =>
  units > 0 ? Math.round((feeCents / units) * multiplier * 100) / 100 : null;

const earliest = (list) => {
  const t = list.filter(Boolean).sort();
  return t.length ? t[0] : null;
};
const latest = (list) => {
  const t = list.filter(Boolean).sort();
  return t.length ? t[t.length - 1] : null;
};

const CAMPAIGN_SQL = `
  SELECT
    c.id,
    c.name                AS campaign_name,
    c.budget_cents,
    c.target_cpa_cents,
    c.currency,
    c.status,
    ${utc('c.created_at', 'created_at')},
    cl.name               AS client_name
  FROM campaigns c
  JOIN clients cl ON cl.id = c.client_id
  WHERE c.report_token = $1
  LIMIT 1
`;

// delivered_views is read through to_jsonb() on purpose: the column does not
// exist in db/schema.sql yet, and a missing jsonb key yields NULL instead of
// erroring. So CPM stays null ("not known") today and starts reporting the day
// the column lands, without a second deploy here. We never substitute audience
// size for delivered views — that would be an invented metric.
const PLACEMENTS_SQL = `
  SELECT
    p.id,
    p.code,
    p.agreed_fee_cents,
    ${utc('p.live_at', 'live_at')},
    cr.handle,
    cr.platform,
    cr.audience_size,
    COALESCE(
      to_jsonb(p) ->> 'delivered_views',
      to_jsonb(p) ->> 'views'
    )::bigint                                    AS delivered_views,
    k.clicks,
    ${utc('k.first_click', 'first_click')},
    ${utc('k.last_click', 'last_click')},
    v.conversions,
    v.value_cents,
    ${utc('v.last_conversion', 'last_conversion')}
  FROM placements p
  JOIN creators cr ON cr.id = p.creator_id
  LEFT JOIN LATERAL (
    SELECT count(*) AS clicks, min(ts) AS first_click, max(ts) AS last_click
    FROM clicks WHERE placement_id = p.id
  ) k ON TRUE
  LEFT JOIN LATERAL (
    SELECT count(*) AS conversions,
           COALESCE(sum(value_cents), 0) AS value_cents,
           max(ts) AS last_conversion
    FROM conversions WHERE placement_id = p.id
  ) v ON TRUE
  WHERE p.campaign_id = $1
  ORDER BY p.live_at ASC NULLS LAST, cr.handle ASC
`;

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  // Identical response for "no token", "junk token" and "unknown token".
  const notFound = () => res.status(404).json({ error: 'not_found' });

  const raw = req.query?.token;
  const token = Array.isArray(raw) ? raw[0] : raw;
  if (typeof token !== 'string' || !/^[0-9a-f]{16,128}$/i.test(token)) {
    return notFound();
  }

  if (!isConfigured()) {
    console.error('[report] DATABASE_URL is not set');
    return res.status(500).json({ error: 'server_error' });
  }

  let campaign;
  let placementRows;
  try {
    const found = await query(CAMPAIGN_SQL, [token]);
    if (found.length === 0) return notFound();
    campaign = found[0];
    placementRows = await query(PLACEMENTS_SQL, [campaign.id]);
  } catch (err) {
    console.error('[report]', err?.message || err);
    return res.status(500).json({ error: 'server_error' });
  }

  const placements = placementRows.map((r) => {
    const feeCents = int(r.agreed_fee_cents);
    const clicks = int(r.clicks);
    const conversions = int(r.conversions);
    const deliveredViews = num(r.delivered_views);

    return {
      id: r.id,
      code: r.code,
      creator: {
        handle: r.handle,
        platform: r.platform,
        audienceSize: num(r.audience_size),
      },
      liveAt: r.live_at,
      feeCents,
      deliveredViews,
      clicks,
      conversions,
      valueCents: int(r.value_cents),
      cpmCents: deliveredViews > 0 ? per(feeCents, deliveredViews, 1000) : null,
      cpcCents: per(feeCents, clicks),
      cpaCents: per(feeCents, conversions),
      firstEventAt: r.first_click,
      lastEventAt: latest([r.last_click, r.last_conversion]),
    };
  });

  const sum = (pick) => placements.reduce((n, p) => n + (pick(p) || 0), 0);
  const feeCents = sum((p) => p.feeCents);
  const clicks = sum((p) => p.clicks);
  const conversions = sum((p) => p.conversions);

  // CPM is blended only across placements whose delivered views we actually
  // hold. Mixing in unknowns would understate it.
  const withViews = placements.filter((p) => p.deliveredViews > 0);
  const knownViews = withViews.reduce((n, p) => n + p.deliveredViews, 0);
  const feeOnKnownViews = withViews.reduce((n, p) => n + p.feeCents, 0);

  const startsAt =
    earliest([
      ...placements.map((p) => p.liveAt),
      ...placements.map((p) => p.firstEventAt),
    ]) || campaign.created_at;
  const endsAt = latest(placements.map((p) => p.lastEventAt));

  return res.status(200).json({
    client: { name: campaign.client_name },
    campaign: {
      name: campaign.campaign_name,
      status: campaign.status,
      currency: campaign.currency,
      budgetCents: int(campaign.budget_cents),
      targetCpaCents: num(campaign.target_cpa_cents),
      createdAt: campaign.created_at,
      startsAt,
      endsAt,
    },
    placements,
    totals: {
      placements: placements.length,
      feeCents,
      clicks,
      conversions,
      valueCents: sum((p) => p.valueCents),
      deliveredViews: knownViews > 0 ? knownViews : null,
      cpmCents: knownViews > 0 ? per(feeOnKnownViews, knownViews, 1000) : null,
      cpcCents: per(feeCents, clicks),
      cpaCents: per(feeCents, conversions),
    },
    generatedAt: new Date().toISOString(),
  });
}
