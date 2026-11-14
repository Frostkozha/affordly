import type { CreatorApplication } from '../../packages/engine/src/api';
import { HttpError, json, readJson, type Env } from './http';

function application(value: unknown): CreatorApplication {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'Invalid application');
  }
  const body = value as Record<string, unknown>;
  const field = (key: string, min: number, max: number): string => {
    const raw = body[key];
    if (typeof raw !== 'string' || /[\x00-\x1f\x7f-\x9f]/.test(raw)) {
      throw new HttpError(400, 'Invalid ' + key);
    }
    const text = raw.trim();
    if (text.length < min || text.length > max) throw new HttpError(400, 'Invalid ' + key);
    return text;
  };
  const name = field('name', 1, 80);
  const platform = field('platform', 1, 20) as CreatorApplication['platform'];
  const handle = field('handle', 1, 120);
  const followers = field('followers', 1, 20) as CreatorApplication['followers'];
  const note = field('note', 0, 500);
  if (!['tiktok', 'instagram', 'youtube', 'other'].includes(platform)) {
    throw new HttpError(400, 'Invalid platform');
  }
  if (!['under-1k', '1k-10k', '10k-100k', 'over-100k'].includes(followers)) {
    throw new HttpError(400, 'Invalid followers');
  }
  return { name, platform, handle, followers, note };
}

export async function creators(request: Request, env: Env, url: URL): Promise<Response | null> {
  if (request.method !== 'POST' || url.pathname !== '/api/creators') return null;
  const body = application(await readJson(request));
  const now = new Date().toISOString();
  const date = now.slice(0, 10);
  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip + date));
  const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  // One atomic statement prevents concurrent requests from passing the daily limit together.
  const inserted = await env.DB.prepare(
    'INSERT INTO creator_applications (created_at, name, platform, handle, followers, note, ip_hash) '
    + 'SELECT ?, ?, ?, ?, ?, ?, ? WHERE '
    + '(SELECT COUNT(*) FROM creator_applications WHERE ip_hash = ?) < 3',
  ).bind(now, body.name, body.platform, body.handle, body.followers, body.note, hash, hash).run();
  if (!inserted.meta.changes) throw new HttpError(429, 'Daily application limit reached');
  return json({ ok: true }, 201);
}
