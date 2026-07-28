// POST /api/conversion — the client's server tells us a tracked visitor converted.
//
//   curl -X POST https://creator.akalds.com/api/conversion \
//     -H 'Authorization: Bearer <key>' \
//     -H 'Content-Type: application/json' \
//     -d '{"ref":"demo","event":"signup","external_id":"usr_123","value_cents":4900}'
//
// Idempotency is the whole contract. Client jobs retry — on timeout, on deploy,
// on a queue redelivery. The unique index conversions_idempotency
// (placement_id, event, external_id) is what makes a retry a no-op; without it
// one retried signup silently doubles and every CPA on every report is wrong.
// So: ON CONFLICT DO NOTHING, and a 23505 raised anywhere is still a success.
//
// Server-to-server only. The key is a secret, so there is deliberately no CORS
// header here — a key that works from a browser is a key that has leaked.
//
// api_keys.key_hash stores the sha256 hex digest of the raw key.

import { createHash, timingSafeEqual } from 'node:crypto';
import { sql, isConfigured, isUniqueViolation } from '../src/lib/db.js';

const MAX_BODY_BYTES = 16 * 1024;
const CODE_RE = /^[A-Za-z0-9_-]{1,64}$/;
const EVENT_RE = /^[A-Za-z0-9_.:-]{1,64}$/;
const MAX_EXTERNAL_ID = 255;
const MAX_VALUE_CENTS = 1e15; // comfortably inside bigint

function bearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (typeof header !== 'string') return null;
  const m = header.match(/^Bearer\s+(.+)$/i);
  const token = m && m[1].trim();
  return token && token.length >= 8 && token.length <= 512 ? token : null;
}

async function readJsonBody(req) {
  // Vercel parses JSON bodies for us; the fallbacks cover raw strings, Buffers
  // and any runtime that hands us an unread stream.
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  let raw = null;
  if (typeof req.body === 'string') raw = req.body;
  else if (Buffer.isBuffer(req.body)) raw = req.body.toString('utf8');
  else {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) throw new Error('body_too_large');
      chunks.push(chunk);
    }
    raw = Buffer.concat(chunks).toString('utf8');
  }
  if (!raw || !raw.trim()) return {};
  return JSON.parse(raw);
}

/** @returns {{ ok: true, value: object } | { ok: false, error: string }} */
function validate(body) {
  const ref = typeof body.ref === 'string' ? body.ref.trim() : null;
  if (!ref || !CODE_RE.test(ref)) return { ok: false, error: 'invalid_ref' };

  const event = typeof body.event === 'string' ? body.event.trim() : null;
  if (!event || !EVENT_RE.test(event)) return { ok: false, error: 'invalid_event' };

  const externalId = typeof body.external_id === 'string' ? body.external_id.trim() : null;
  if (!externalId || externalId.length > MAX_EXTERNAL_ID) {
    return { ok: false, error: 'invalid_external_id' };
  }

  const rawValue = body.value_cents;
  let valueCents = 0;
  if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
    if (typeof rawValue === 'number') valueCents = rawValue;
    else if (typeof rawValue === 'string' && /^\d+$/.test(rawValue)) valueCents = Number(rawValue);
    else return { ok: false, error: 'invalid_value_cents' };

    if (!Number.isInteger(valueCents) || valueCents < 0 || valueCents > MAX_VALUE_CENTS) {
      return { ok: false, error: 'invalid_value_cents' };
    }
  }

  return { ok: true, value: { ref, event, externalId, valueCents } };
}

const sha256Hex = (value) => createHash('sha256').update(value).digest('hex');

/** Constant-time compare of two hex digests of equal length. */
function digestsMatch(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const token = bearerToken(req);
  if (!token) {
    res.setHeader('WWW-Authenticate', 'Bearer');
    return res.status(401).json({ error: 'unauthorized' });
  }

  if (!isConfigured()) {
    return res.status(503).json({ error: 'not_configured' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    const tooLarge = err && err.message === 'body_too_large';
    return res.status(tooLarge ? 413 : 400).json({ error: tooLarge ? 'body_too_large' : 'invalid_json' });
  }

  const parsed = validate(body || {});
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.error });
  }
  const { ref, event, externalId, valueCents } = parsed.value;

  const keyHash = sha256Hex(token);

  try {
    const keys = await sql`
      SELECT id, client_id, key_hash
      FROM api_keys
      WHERE key_hash = ${keyHash} AND revoked_at IS NULL
      LIMIT 1
    `;
    const key = keys[0];
    if (!key || !digestsMatch(key.key_hash, keyHash)) {
      res.setHeader('WWW-Authenticate', 'Bearer');
      return res.status(401).json({ error: 'unauthorized' });
    }

    // The placement must belong to the key's client. Anything else is treated
    // as an unknown ref so a key cannot be used to enumerate other clients'.
    const placements = await sql`
      SELECT p.id
      FROM placements p
      JOIN campaigns c ON c.id = p.campaign_id
      WHERE p.code = ${ref} AND c.client_id = ${key.client_id}
      LIMIT 1
    `;
    const placement = placements[0];
    if (!placement) {
      return res.status(404).json({ error: 'unknown_ref' });
    }

    const inserted = await sql`
      INSERT INTO conversions (placement_id, event, external_id, value_cents)
      VALUES (${placement.id}, ${event}, ${externalId}, ${valueCents})
      ON CONFLICT (placement_id, event, external_id) DO NOTHING
      RETURNING id
    `;

    if (!inserted.length) {
      // Already recorded. The retry is the expected path, not an error.
      return res.status(200).json({ ok: true, duplicate: true });
    }

    return res.status(200).json({ ok: true, duplicate: false, id: Number(inserted[0].id) });
  } catch (err) {
    // Belt and braces: if the conflict target is ever missed, the unique index
    // still fires and a retry must not be reported as a failure.
    if (isUniqueViolation(err)) {
      return res.status(200).json({ ok: true, duplicate: true });
    }
    console.error('[conversion] failed', { ref, event, message: err && err.message });
    // 503, not 500: this is retryable and retries are safe by construction.
    return res.status(503).json({ error: 'unavailable' });
  }
}
