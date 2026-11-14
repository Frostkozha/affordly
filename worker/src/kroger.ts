import { HttpError, json, type Env } from './http';

let token: { value: string; expiresAt: number; key: string } | undefined;
export async function getToken(env: Env): Promise<string> {
  const key = `${env.KROGER_BASE}:${env.KROGER_CLIENT_ID}:${env.KROGER_CLIENT_SECRET}`;
  if (token && token.key === key && Date.now() < token.expiresAt) return token.value;
  if (!env.KROGER_CLIENT_ID || !env.KROGER_CLIENT_SECRET) throw new HttpError(503, 'Store service unavailable');
  const response = await fetch(`${env.KROGER_BASE}/v1/connect/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${env.KROGER_CLIENT_ID}:${env.KROGER_CLIENT_SECRET}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials&scope=product.compact',
  });
  if (!response.ok) throw new HttpError(502, 'Store authentication failed');
  const data = await response.json() as { access_token: string; expires_in: number };
  if (typeof data.access_token !== 'string' || !Number.isFinite(data.expires_in)) throw new HttpError(502, 'Invalid store response');
  token = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000, key };
  return token.value;
}

interface Product { productId: string; description: string; items?: { size?: string; price?: { regular?: number } }[] }
export async function kroger(request: Request, env: Env, url: URL): Promise<Response | null> {
  if (request.method !== 'GET') return null;
  let path: string;
  const params = new URLSearchParams();
  if (url.pathname === '/api/kroger/locations') {
    const zip = url.searchParams.get('zip') ?? '';
    if (!/^\d{5}$/.test(zip)) throw new HttpError(400, 'Invalid zip');
    path = '/v1/locations'; params.set('filter.zipCode.near', zip); params.set('filter.limit', '5');
  } else if (url.pathname === '/api/kroger/products') {
    const term = (url.searchParams.get('term') ?? '').trim();
    const locationId = url.searchParams.get('locationId') ?? '';
    if (!term || term.length > 60) throw new HttpError(400, 'Invalid term');
    if (!/^\d{8}$/.test(locationId)) throw new HttpError(400, 'Invalid locationId');
    path = '/v1/products'; params.set('filter.term', term); params.set('filter.locationId', locationId); params.set('filter.limit', '10');
  } else return null;
  const cache = (caches as CacheStorage & { default: Cache }).default;
  const cacheUrl = new URL(request.url);
  cacheUrl.search = params.toString();
  const cacheKey = new Request(cacheUrl, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) return cached;
  const response = await fetch(`${env.KROGER_BASE}${path}?${params}`, { headers: { Authorization: `Bearer ${await getToken(env)}` } });
  if (!response.ok) throw new HttpError(502, 'Store request failed');
  const data = await response.json() as { data: unknown[] };
  if (!Array.isArray(data.data)) throw new HttpError(502, 'Invalid store response');
  const result = path === '/v1/locations'
    ? { locations: (data.data as { locationId: string; name: string; address: unknown }[]).map(({ locationId, name, address }) => ({ locationId, name, address })) }
    : { products: (data.data as Product[]).map(p => ({ productId: p.productId, description: p.description, size: p.items?.[0]?.size ?? null, price: p.items?.[0]?.price?.regular ?? null })) };
  const output = json(result);
  output.headers.set('Cache-Control', 'public, max-age=21600');
  await cache.put(cacheKey, output.clone());
  return output;
}
