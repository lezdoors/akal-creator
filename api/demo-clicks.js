// GET /api/demo-clicks — the last 8 real clicks on the seeded demo placement.
//
// This backs the live demo on the landing page: a visitor opens /go/demo, comes
// back, and sees their own click land in the ledger. Every row here is a real
// row from the clicks table — nothing is synthesised, and an empty ledger is
// shown as empty rather than padded out.
//
// The demo client/campaign/creator/placement are seeded here with fixed UUIDs
// and ON CONFLICT DO NOTHING, so the endpoint works on a freshly migrated
// database with no manual setup. The creator is a role descriptor, never a
// real handle.

import { sql, isConfigured } from '../src/lib/db.js';

const SITE_ROOT = process.env.SITE_URL || 'https://creator.akalds.com';

const DEMO = {
  clientId: 'a4a10000-0000-4000-8000-000000000001',
  campaignId: 'a4a10000-0000-4000-8000-000000000002',
  creatorId: 'a4a10000-0000-4000-8000-000000000003',
  placementId: 'a4a10000-0000-4000-8000-000000000004',
  code: 'demo',
};

// Per-container guard: the seed is idempotent, but there is no reason to send
// four writes on every warm invocation.
let seeded = false;

async function ensureDemoPlacement() {
  if (seeded) return;
  await sql.transaction([
    sql`
      INSERT INTO clients (id, name, contact_email)
      VALUES (${DEMO.clientId}, 'AKAL Creator demo', NULL)
      ON CONFLICT DO NOTHING
    `,
    sql`
      INSERT INTO campaigns (id, client_id, name, budget_cents, currency, status)
      VALUES (${DEMO.campaignId}, ${DEMO.clientId}, 'Live link demo', 0, 'USD', 'demo')
      ON CONFLICT DO NOTHING
    `,
    sql`
      INSERT INTO creators (id, handle, platform, topic_tags)
      VALUES (${DEMO.creatorId}, 'demo-placement', 'demo', ARRAY['demo']::text[])
      ON CONFLICT DO NOTHING
    `,
    sql`
      INSERT INTO placements (id, campaign_id, creator_id, code, dest_url, agreed_fee_cents, live_at)
      VALUES (
        ${DEMO.placementId}, ${DEMO.campaignId}, ${DEMO.creatorId},
        ${DEMO.code}, ${SITE_ROOT + '/'}, 0, now()
      )
      ON CONFLICT DO NOTHING
    `,
  ]);
  seeded = true;
}

/** Coarse device label from a user-agent string. Deliberately low-resolution. */
export function deviceFromUa(ua) {
  if (typeof ua !== 'string' || !ua.trim()) return 'Unknown';
  const s = ua.toLowerCase();
  if (/bot|crawler|spider|preview|curl|wget|headless|python-requests|axios/.test(s)) return 'Bot';
  if (/ipad|tablet|playbook|silk/.test(s)) return 'Tablet';
  if (/iphone|ipod/.test(s)) return 'iPhone';
  if (/android/.test(s)) return /mobile/.test(s) ? 'Android' : 'Android tablet';
  if (/mac os x|macintosh/.test(s)) return 'Mac';
  if (/windows/.test(s)) return 'Windows';
  if (/cros/.test(s)) return 'ChromeOS';
  if (/linux|x11/.test(s)) return 'Linux';
  return 'Other';
}

/** Referrers are shown in a ledger column: host only, or null for direct. */
function referrerHost(referrer) {
  if (typeof referrer !== 'string' || !referrer.trim()) return null;
  try {
    return new URL(referrer).host || null;
  } catch {
    return referrer.slice(0, 64);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'method_not_allowed', clicks: [] });
  }

  // Live means live — the visitor's own click has to appear on the next load.
  res.setHeader('Cache-Control', 'no-store');

  if (!isConfigured()) {
    return res.status(503).json({ error: 'not_configured', clicks: [] });
  }

  try {
    await ensureDemoPlacement();

    const rows = await sql`
      SELECT c.id, c.ts, c.country, c.referrer, c.ua
      FROM clicks c
      JOIN placements p ON p.id = c.placement_id
      WHERE p.code = ${DEMO.code}
      ORDER BY c.ts DESC, c.id DESC
      LIMIT 8
    `;

    const clicks = rows.map((row) => ({
      id: Number(row.id),
      ts: row.ts instanceof Date ? row.ts.toISOString() : new Date(row.ts).toISOString(),
      country: row.country || null,
      referrer: referrerHost(row.referrer),
      device: deviceFromUa(row.ua),
    }));

    return res.status(200).json({ clicks });
  } catch (err) {
    seeded = false; // the seed may not have landed; try again next invocation
    console.error('[demo-clicks] failed', { message: err && err.message });
    return res.status(503).json({ error: 'unavailable', clicks: [] });
  }
}
