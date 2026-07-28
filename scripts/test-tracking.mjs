/**
 * End-to-end test of the tracking service against the real Neon database.
 *
 *   node --env-file=.env.local scripts/test-tracking.mjs
 *
 * Exercises the two properties the whole product rests on:
 *   1. /go/:code redirects BEFORE writing, and the click still lands.
 *   2. /api/conversion is idempotent — a retried postback must not double-count,
 *      or every CPA on every client report is wrong.
 */
import go from '../api/go.js';
import conversion from '../api/conversion.js';
import demoClicks from '../api/demo-clicks.js';
import report from '../api/report.js';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => {
  console.log(`  FAIL  ${m}`);
  process.exitCode = 1;
};

/** Minimal Node-style res double. */
function mockRes() {
  const r = {
    statusCode: 200,
    headers: {},
    body: undefined,
    ended: false,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; return this; },
    getHeader(k) { return this.headers[k.toLowerCase()]; },
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; this.ended = true; return this; },
    send(b) { this.body = b; this.ended = true; return this; },
    end(b) { if (b !== undefined) this.body = b; this.ended = true; return this; },
    redirect(a, b) {
      this.statusCode = typeof a === 'number' ? a : 302;
      this.headers.location = typeof a === 'number' ? b : a;
      this.ended = true;
      return this;
    },
  };
  return r;
}

const req = (over = {}) => ({
  method: 'GET',
  url: '/',
  query: {},
  body: {},
  headers: { 'user-agent': 'test-harness/1.0', 'x-forwarded-for': '203.0.113.9' },
  ...over,
});

console.log('\n1. Seed + demo endpoint');
{
  const res = mockRes();
  await demoClicks(req({ url: '/api/demo-clicks' }), res);
  if (res.statusCode === 200 && Array.isArray(res.body?.clicks)) pass(`demo-clicks 200, ${res.body.clicks.length} rows`);
  else fail(`demo-clicks -> ${res.statusCode} ${JSON.stringify(res.body).slice(0, 120)}`);
}

const [placement] = await sql`SELECT id, code, dest_url FROM placements WHERE code = 'demo' LIMIT 1`;
if (placement) pass(`demo placement seeded (${placement.code} -> ${placement.dest_url})`);
else { fail('demo placement was not seeded'); process.exit(1); }

console.log('\n2. Redirect');
const before = (await sql`SELECT count(*)::int AS n FROM clicks WHERE placement_id = ${placement.id}`)[0].n;
{
  const res = mockRes();
  await go(req({ url: '/go/demo?utm_source=newsletter', query: { code: 'demo', utm_source: 'newsletter' } }), res);
  const loc = res.headers.location || '';
  if (res.statusCode === 302 || res.statusCode === 307) pass(`redirect ${res.statusCode}`);
  else fail(`expected 302, got ${res.statusCode}`);
  if (loc.includes('ref=demo')) pass('ref=demo appended'); else fail(`ref missing: ${loc}`);
  if (loc.includes('utm_source=newsletter')) pass('client UTM preserved'); else fail(`utm dropped: ${loc}`);
  const ck = res.headers['set-cookie'];
  if (ck && String(ck).includes('akal_ref')) pass('first-party cookie set'); else fail('akal_ref cookie missing');
}

// The write is deliberately after the redirect, so give it a beat to land.
await new Promise((r) => setTimeout(r, 1200));
const after = (await sql`SELECT count(*)::int AS n FROM clicks WHERE placement_id = ${placement.id}`)[0].n;
if (after === before + 1) pass(`click row landed (${before} -> ${after})`);
else fail(`click not recorded (${before} -> ${after})`);

const [lastClick] = await sql`SELECT ip_hash, ua FROM clicks WHERE placement_id = ${placement.id} ORDER BY ts DESC LIMIT 1`;
// With no IP_SALT configured the handler stores null by design — an unsalted
// sha256 of an IPv4 is trivially reversible, so refusing to write beats writing
// a fake-anonymous value. Assert the correct behaviour for each case.
if (process.env.IP_SALT) {
  if (lastClick?.ip_hash?.length === 64 && !String(lastClick.ip_hash).includes('203.0.113')) pass('IP stored salted-hashed, not raw');
  else fail(`expected 64-char salted hash, got: ${lastClick?.ip_hash}`);
} else {
  if (lastClick?.ip_hash === null) pass('no IP_SALT -> ip_hash null (correct fail-safe)');
  else fail(`no salt configured but ip_hash written: ${lastClick?.ip_hash}`);
}

console.log('\n3. Unknown code must never 500');
{
  const res = mockRes();
  await go(req({ url: '/go/nope', query: { code: 'nope-does-not-exist' } }), res);
  if ([301, 302, 307, 308].includes(res.statusCode)) pass(`unknown code -> ${res.statusCode} to root`);
  else fail(`unknown code -> ${res.statusCode} (must redirect, never error)`);
}

console.log('\n4. Conversion idempotency — the one that breaks every CPA');
{
  const [client] = await sql`SELECT c.id FROM clients c JOIN campaigns ca ON ca.client_id = c.id
                             JOIN placements p ON p.campaign_id = ca.id WHERE p.id = ${placement.id} LIMIT 1`;
  const raw = 'test-key-' + Date.now();
  const { createHash } = await import('node:crypto');
  const hash = createHash('sha256').update(raw).digest('hex');
  await sql`INSERT INTO api_keys (client_id, label, key_hash) VALUES (${client.id}, 'harness', ${hash})`;

  const extId = 'signup-' + Date.now();
  const post = () => {
    const res = mockRes();
    return conversion(req({
      method: 'POST',
      url: '/api/conversion',
      headers: { authorization: `Bearer ${raw}`, 'content-type': 'application/json' },
      body: { ref: 'demo', event: 'signup', external_id: extId, value_cents: 4900 },
    }), res).then(() => res);
  };

  const r1 = await post();
  if (r1.statusCode === 200) pass('first postback 200'); else fail(`first postback -> ${r1.statusCode} ${JSON.stringify(r1.body)}`);
  const r2 = await post();
  if (r2.statusCode === 200) pass('retried postback 200 (not an error)'); else fail(`retry -> ${r2.statusCode}`);

  const n = (await sql`SELECT count(*)::int AS n FROM conversions
                       WHERE placement_id = ${placement.id} AND external_id = ${extId}`)[0].n;
  if (n === 1) pass(`exactly 1 conversion row after 2 identical postbacks`);
  else fail(`IDEMPOTENCY BROKEN: ${n} rows — every CPA would be wrong`);

  const bad = mockRes();
  await conversion(req({ method: 'POST', headers: { authorization: 'Bearer wrong' },
    body: { ref: 'demo', event: 'signup', external_id: 'x' } }), bad);
  if (bad.statusCode === 401) pass('bad key -> 401'); else fail(`bad key -> ${bad.statusCode} (must be 401)`);

  await sql`DELETE FROM conversions WHERE external_id = ${extId}`;
  await sql`DELETE FROM api_keys WHERE key_hash = ${hash}`;
}

console.log('\n5. Client report');
{
  const [c] = await sql`SELECT report_token FROM campaigns LIMIT 1`;
  const ok = mockRes();
  await report(req({ url: `/api/report?token=${c.report_token}`, query: { token: c.report_token } }), ok);
  if (ok.statusCode === 200) pass('valid token -> 200'); else fail(`valid token -> ${ok.statusCode} ${JSON.stringify(ok.body).slice(0,150)}`);

  const bad = mockRes();
  await report(req({ url: '/api/report?token=deadbeef', query: { token: 'deadbeef' } }), bad);
  if (bad.statusCode === 404) pass('unknown token -> 404'); else fail(`unknown token -> ${bad.statusCode}`);
  const body = JSON.stringify(bad.body || '').toLowerCase();
  if (!body.includes('campaign') || body.length < 80) pass('404 body is generic (not token-probeable)');
  else fail(`404 body leaks detail: ${body.slice(0, 120)}`);
}

console.log(process.exitCode ? '\nFAILURES ABOVE\n' : '\nAll tracking checks passed\n');
