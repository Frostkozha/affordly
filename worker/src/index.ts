import { account } from './account';
import { kroger } from './kroger';
import { HttpError, json, type Env } from './http';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    let response: Response;
    try {
      const url = new URL(request.url);
      if (request.method === 'OPTIONS') response = new Response(null, { status: 204 });
      else if (request.method === 'GET' && url.pathname === '/api/health') response = json({ ok: true });
      else {
        // assistant route is registered here
        response = await account(request, env, url) ?? await kroger(request, env, url) ?? json({ error: 'Not found' }, 404);
      }
    } catch (error) {
      response = error instanceof HttpError
        ? json({ error: error.message }, error.status)
        : json({ error: 'Internal server error' }, 500);
    }
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', env.ALLOWED_ORIGIN);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    headers.set('Vary', 'Origin');
    return new Response(response.body, { status: response.status, headers });
  },
};
