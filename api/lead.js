// Lead capture for the BookingSheet fallback form.
// Requires RESEND_API_KEY in Vercel env. Optional: LEAD_TO_EMAIL, LEAD_FROM_EMAIL.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { name, email, company, adSpend } = req.body || {};
  if (!name || !email || typeof name !== 'string' || typeof email !== 'string') {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'not_configured' });
  }

  const to = process.env.LEAD_TO_EMAIL || 'ryanaoufal@gmail.com';
  const from = process.env.LEAD_FROM_EMAIL || 'onboarding@resend.dev';

  const text = [
    'New lead from latitudemarketing booking form',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || '-'}`,
    `Monthly ad spend: ${adSpend || '-'}`,
  ].join('\n');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Latitude Website <${from}>`,
      to: [to],
      reply_to: email,
      subject: `New lead: ${name}${company ? ` (${company})` : ''}`,
      text,
    }),
  });

  if (!r.ok) {
    return res.status(502).json({ error: 'send_failed' });
  }
  return res.status(200).json({ ok: true });
}
