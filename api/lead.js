// AKAL Creator — inbound lead capture.
//
// Contract:  POST { name, email, company, website, budget_band, message }
//
// The Neon row is the source of truth. Resend is a notification, not storage:
//   row written + mail sent    -> 200 { ok: true }
//   row written + mail failed  -> 200 { ok: true, notified: false }  (failure logged)
//   row failed                 -> 502 { error: 'store_failed' }      (mail attempted as fallback)
//
// Env: DATABASE_URL, RESEND_API_KEY, LEAD_TO_EMAIL, LEAD_FROM_EMAIL.
// No env value, connection string, or stack trace ever reaches the response body.
import { sql } from '../src/lib/db.js';

const EMAIL_RE = /^[^\s@,;:<>"'\\]+@[^\s@,;:<>"'\\]+\.[A-Za-z]{2,}$/;
// Two objects on purpose: a /g regex carries lastIndex between .test() calls,
// and this module is reused across invocations on a warm function.
const HAS_LINK_RE = /https?:\/\/|www\./i;
const LINK_RE = /https?:\/\/|www\./gi;
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

// Trim, strip control characters, cap length. Never throws.
function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(CONTROL_RE, '').trim().slice(0, max);
}

function countLinks(text) {
  const found = text.match(LINK_RE);
  return found ? found.length : 0;
}

// Only rejects what cannot be a real lead. Everything else is truncated, not
// refused — a bounced form is a lost lead.
function validate(body) {
  const name = clean(body.name, 120);
  const email = clean(body.email, 254).toLowerCase();
  // The form field was `budget` before the schema landed; accept both so a
  // half-deployed frontend cannot drop leads on the floor.
  const budgetBand = clean(body.budget_band ?? body.budget, 80);
  const message = clean(body.message, 5000);

  if (!name || !email) return { error: 'missing_fields' };
  if (name.length < 2) return { error: 'invalid_name' };
  if (!EMAIL_RE.test(email)) return { error: 'invalid_email' };
  // Spam signatures: a URL or markup where a human name goes, or a link blast.
  if (HAS_LINK_RE.test(name) || /[<>]/.test(name)) return { error: 'rejected' };
  if (countLinks(message) >= 5) return { error: 'rejected' };

  return {
    lead: {
      name,
      email,
      company: clean(body.company, 200) || null,
      website: clean(body.website, 500) || null,
      budget_band: budgetBand || null,
      message: message || null,
      source: clean(body.source, 80) || 'site',
    },
  };
}

function buildEmail(lead, stored) {
  const lines = [
    stored
      ? 'New lead from the AKAL Creator site.'
      : 'New lead from the AKAL Creator site — THE DATABASE WRITE FAILED. This email is the only copy. Re-enter it by hand.',
    '',
    `Name:    ${lead.name}`,
    `Email:   ${lead.email}`,
    `Company: ${lead.company || '-'}`,
    `Website: ${lead.website || '-'}`,
    `Budget:  ${lead.budget_band || '-'}`,
    `Source:  ${lead.source}`,
    '',
    'Message:',
    lead.message || '-',
  ];
  const who = lead.company ? `${lead.name} (${lead.company})` : lead.name;
  return {
    subject: `${stored ? '' : '[DB WRITE FAILED] '}AKAL Creator lead: ${who}`,
    text: lines.join('\n'),
  };
}

// Resolves true/false. Never throws — the caller's status must not depend on it.
async function notify(lead, stored) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('lead: RESEND_API_KEY not set, notification skipped');
    return false;
  }

  const to = process.env.LEAD_TO_EMAIL;
  const from = process.env.LEAD_FROM_EMAIL;
  if (!to || !from) {
    console.error('lead: LEAD_TO_EMAIL or LEAD_FROM_EMAIL not set, notification skipped');
    return false;
  }

  const { subject, text } = buildEmail(lead, stored);
  // Hard timeout: the row is already safe, a hung mail API must not burn the
  // function's whole budget.
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 8000);

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `AKAL Creator <${from}>`,
        to: [to],
        reply_to: lead.email,
        subject,
        text,
      }),
      signal: abort.signal,
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error(`lead: resend responded ${r.status}: ${detail.slice(0, 500)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('lead: resend request failed:', err?.message || err);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'invalid_body' });
    }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'invalid_body' });
  }

  const { error, lead } = validate(body);
  if (error) return res.status(400).json({ error });

  // 1. The row. This is the lead.
  try {
    await sql`
      INSERT INTO leads (name, email, company, website, budget_band, message, source)
      VALUES (
        ${lead.name},
        ${lead.email},
        ${lead.company},
        ${lead.website},
        ${lead.budget_band},
        ${lead.message},
        ${lead.source}
      )
      RETURNING id
    `;
  } catch (err) {
    console.error('lead: insert failed:', err?.message || err);
    // Fall back to email so the lead still reaches a human, then report the
    // real failure. Deliberately not awaited into the status code.
    const notified = await notify(lead, false);
    return res.status(502).json({ error: 'store_failed', notified });
  }

  // 2. The notification. Best effort — the lead is already banked.
  const notified = await notify(lead, true);
  return res.status(200).json(notified ? { ok: true } : { ok: true, notified: false });
}
