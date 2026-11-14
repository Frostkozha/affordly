import type { AssistantRequest } from '../../../packages/engine/src/api';
import type { Env } from '../http';

export async function modelAllowed(accountId: unknown, env: Env): Promise<boolean> {
  if (typeof accountId !== 'string' || !/^[a-f0-9]{32}$/i.test(accountId)) return false;
  try {
    const sql = 'INSERT INTO usage (account_id, day, count) VALUES (?, ?, 1) '
      + 'ON CONFLICT(account_id, day) DO UPDATE SET count = count + 1 '
      + 'WHERE count < 40 RETURNING count';
    const row = await env.DB.prepare(sql)
      .bind(accountId.toLowerCase(), new Date().toISOString().slice(0, 10)).first<{ count: number }>();
    return !!row && row.count <= 40;
  } catch {
    return false;
  }
}

// A continuation carries the routing result so the second request never routes again.
// Failed continuation validation disables model writing but still returns checked templates.
let continuationKey: Promise<CryptoKey> | undefined;

export async function proof(body: AssistantRequest, ticket?: string): Promise<string | null> {
  const issued = ticket === undefined ? Date.now() : Number(ticket.split(':')[0]);
  if (!Number.isFinite(issued) || issued > Date.now() || Date.now() - issued > 600000) return null;
  continuationKey ??= crypto.subtle.generateKey(
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'],
  );
  const payload = JSON.stringify([issued, body.accountId, body.message, body.asked, body.route,
    body.inputs, body.pantry, body.plan, body.plus, body.history]);
  const signature = await crypto.subtle.sign('HMAC', await continuationKey,
    new TextEncoder().encode(payload));
  const hex = Array.from(new Uint8Array(signature), n => n.toString(16).padStart(2, '0')).join('');
  return issued + ':' + hex;
}
