import { describe, expect, it, vi } from 'vitest';
import worker from './index';
import type { Env } from './http';

const application = {
  name: ' Creator ', platform: 'tiktok', handle: '@creator', followers: '1k-10k', note: '',
};
function database() {
  const rows: unknown[][] = [];
  const env = {
    ALLOWED_ORIGIN: 'https://example.com',
    DB: { prepare(sql: string) {
      expect(sql).toContain('INSERT INTO creator_applications');
      let values: unknown[];
      return {
        bind(...args: unknown[]) { values = args; return this; },
        async run() {
          const count = rows.filter(row => row[6] === values[6]).length;
          if (count >= 3) return { meta: { changes: 0 } };
          rows.push(values.slice(0, 7));
          return { meta: { changes: 1 } };
        },
      };
    } },
  } as unknown as Env;
  return { rows, env };
}
const request = (body: unknown, ip = '192.0.2.1') => new Request('https://example.com/api/creators', {
  method: 'POST', headers: { 'CF-Connecting-IP': ip }, body: JSON.stringify(body),
});

describe('creator applications', () => {
  it('stores trimmed fields with a daily IP hash', async () => {
    const { rows, env } = database();
    const response = await worker.fetch(request(application), env);
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
    expect(rows[0].slice(1, 6)).toEqual(['Creator', 'tiktok', '@creator', '1k-10k', '']);
    const date = new Date().toISOString().slice(0, 10);
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('192.0.2.1' + date));
    const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
    expect(rows[0][6]).toBe(hash);
    expect(JSON.stringify(rows)).not.toContain('192.0.2.1');
  });
  it.each([
    ['name', null], ['name', ''], ['name', ' '.repeat(4)], ['name', 'x'.repeat(81)],
    ['platform', 1], ['platform', 'twitter'], ['platform', 'tik\ntok'],
    ['handle', false], ['handle', ''], ['handle', 'x'.repeat(121)],
    ['followers', []], ['followers', 'many'], ['followers', 'over-100k\u007f'],
    ['note', null], ['note', 'x'.repeat(501)], ['note', 'hello\nworld'],
  ])('rejects invalid %s: %j', async (key, value) => {
    const { rows, env } = database();
    const response = await worker.fetch(request({ ...application, [key]: value }), env);
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('error');
    expect(rows).toHaveLength(0);
  });
  it('allows three per day for each hash', async () => {
    const { rows, env } = database();
    for (let i = 0; i < 3; i++) {
      expect((await worker.fetch(request(application), env)).status).toBe(201);
    }
    expect((await worker.fetch(request(application), env)).status).toBe(429);
    expect((await worker.fetch(request(application, '192.0.2.2'), env)).status).toBe(201);
    expect(rows).toHaveLength(4);
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(Date.now() + 24 * 60 * 60 * 1000));
      expect((await worker.fetch(request(application), env)).status).toBe(201);
    } finally {
      vi.useRealTimers();
    }
  });
});
