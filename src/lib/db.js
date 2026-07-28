// Neon Postgres access for the Vercel serverless handlers in /api.
//
// Why the HTTP driver (@neondatabase/serverless) and not node-postgres:
// these functions are short-lived and horizontally scaled. A TCP pool held
// across invocations either leaks connections or gets frozen mid-query when
// the container suspends. The HTTP driver issues one stateless request per
// query, so there is nothing to keep alive, nothing to drain, and no
// connection-pool bug to write.
//
// DATABASE_URL must be the POOLED Neon host (…-pooler.…neon.tech).
//
// Usage:
//   import { sql, query } from '../src/lib/db.js';
//   const rows = await sql`SELECT 1 AS n`;                  // tagged template
//   const rows = await query('SELECT * FROM t WHERE id=$1', [id]);

import { neon } from '@neondatabase/serverless';

/** @type {ReturnType<typeof neon> | null} */
let client = null;

/** True when DATABASE_URL is present. Handlers degrade instead of throwing. */
export function isConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getClient() {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  // Cached at module scope: this is a fetch wrapper, not a socket, so it is
  // safe to reuse across invocations of a warm container.
  client = neon(url);
  return client;
}

/**
 * Tagged-template query. Values are always sent as bound parameters.
 *   await sql`SELECT * FROM placements WHERE code = ${code}`
 */
export function sql(strings, ...params) {
  return getClient()(strings, ...params);
}

/** Parameterised query with $1/$2 placeholders. */
export function query(text, params = []) {
  return getClient().query(text, params);
}

/** Multiple statements as one non-interactive transaction. */
export function transaction(queries, opts) {
  return getClient().transaction(queries, opts);
}

sql.query = query;
sql.transaction = transaction;

/** Postgres unique_violation — the signal that an idempotent write already landed. */
export function isUniqueViolation(err) {
  return Boolean(err) && err.code === '23505';
}

export default sql;
