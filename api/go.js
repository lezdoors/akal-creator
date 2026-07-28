// GET /go/:code  →  302 to the placement's destination.
//
// This is the product. Two rules govern it:
//
//   1. The human never waits on Postgres. The 302 is written and flushed
//      before a single query about the click is issued. If the click insert
//      fails, the redirect has already happened and the visitor is gone.
//   2. Nothing that can identify a person is stored. The IP is salted-hashed
//      (env IP_SALT) for dedupe/fraud work only; if no salt is configured we
//      store nothing rather than an unsalted, brute-forceable digest.
//
// Unknown, malformed, or un-lookupable codes redirect to the site root. This
// endpoint has no error page and returns no 5xx: a dead link on a creator's
// video for the next two years must still land somewhere sane.
//
// vercel.json rewrites /go/:code → /api/go?code=:code.

import { createHash } from 'node:crypto';
import { sql, isConfigured } from '../src/lib/db.js';

const SITE_ROOT = process.env.SITE_URL || 'https://creator.akalds.com';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days
const CODE_RE = /^[A-Za-z0-9_-]{1,64}$/;

// Client-side campaign params we carry through to the destination untouched,
// so the client's own analytics sees what it would have seen anyway.
const PASSTHROUGH = new Set(['gclid', 'fbclid', 'ttclid', 'msclkid', 'li_fat_id']);
const isPassthrough = (key) => /^utm_/i.test(key) || PASSTHROUGH.has(key.toLowerCase());

function incomingUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  try {
    return new URL(req.url || '/', `${proto}://${host}`);
  } catch {
    return new URL('/', 'https://localhost');
  }
}

function readCode(req, url) {
  const fromQuery = req.query && typeof req.query.code === 'string' ? req.query.code : null;
  let code = fromQuery || url.searchParams.get('code');
  if (!code) {
    // Direct hit on /go/:code (local dev, or if the rewrite is ever removed).
    const m = url.pathname.match(/^\/(?:api\/)?go\/([^/?#]+)\/?$/);
    if (m) {
      try {
        code = decodeURIComponent(m[1]);
      } catch {
        code = m[1];
      }
    }
  }
  return code && CODE_RE.test(code) ? code : null;
}

/** Build the outbound URL: destination params win their own keys, campaign params ride along. */
function buildDestination(destUrl, incoming, code) {
  const dest = new URL(destUrl); // throws on a malformed dest_url — caller handles
  for (const [key, value] of incoming.searchParams) {
    if (key === 'code') continue; // injected by the rewrite, not the visitor's
    if (isPassthrough(key)) dest.searchParams.set(key, value);
  }
  dest.searchParams.set('ref', code);
  return dest.toString();
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  if (Array.isArray(fwd) && fwd.length) return String(fwd[0]).split(',')[0].trim();
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real.length) return real;
  return (req.socket && req.socket.remoteAddress) || null;
}

/** Salted sha256. Returns null when no salt is configured — never a raw IP, never an unsalted one. */
function hashIp(ip) {
  const salt = process.env.IP_SALT;
  if (!ip || !salt) return null;
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

const trim = (value, max) =>
  typeof value === 'string' && value.length ? value.slice(0, max) : null;

function sendRedirect(res, location, cookie) {
  res.statusCode = 302;
  res.setHeader('Location', location);
  // Never let a CDN or browser cache the hop: the click must reach us each time.
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  if (cookie) res.setHeader('Set-Cookie', cookie);
  res.end();
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const incoming = incomingUrl(req);
  const code = readCode(req, incoming);

  if (!code || !isConfigured()) {
    return sendRedirect(res, SITE_ROOT);
  }

  // --- Lookup. Any failure here still ends in a redirect, never a 500. ---
  let placement = null;
  try {
    const rows = await sql`
      SELECT id, dest_url
      FROM placements
      WHERE code = ${code}
      LIMIT 1
    `;
    placement = rows[0] || null;
  } catch (err) {
    console.error('[go] lookup failed', { code, message: err && err.message });
  }

  if (!placement) {
    return sendRedirect(res, SITE_ROOT);
  }

  let destination;
  try {
    destination = buildDestination(placement.dest_url, incoming, code);
  } catch (err) {
    console.error('[go] bad dest_url', { code, dest: placement.dest_url });
    return sendRedirect(res, SITE_ROOT);
  }

  const cookie = [
    `akal_ref=${code}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    'Path=/',
    'SameSite=Lax',
    'Secure',
  ].join('; ');

  // --- 1. The visitor leaves. ---
  sendRedirect(res, destination, cookie);

  if (req.method === 'HEAD') return;

  // --- 2. Then, and only then, we write the click. ---
  // Awaited so the container is not frozen mid-insert; the response bytes are
  // already flushed, so this costs the visitor nothing.
  try {
    await sql`
      INSERT INTO clicks (placement_id, ip_hash, ua, country, referrer)
      VALUES (
        ${placement.id},
        ${hashIp(clientIp(req))},
        ${trim(req.headers['user-agent'], 512)},
        ${trim(req.headers['x-vercel-ip-country'], 2)},
        ${trim(req.headers.referer || req.headers.referrer, 512)}
      )
    `;
  } catch (err) {
    // A lost click is a reporting gap, not an outage. Log and move on.
    console.error('[go] click insert failed', {
      code,
      placement_id: placement.id,
      message: err && err.message,
    });
  }
}
