import type { AssistantRequest } from '../../../packages/engine/src/api';
import { json, readJson, type Env } from '../http';
import { route } from './route';
import { answer } from './actions';
import { writeAnswer } from './write';
import { validate } from './validate';
import { modelAllowed, proof } from './quota';
import { verify, verifyComparison } from './verify';

export async function assistant(request: Request, env: Env, url: URL): Promise<Response | null> {
  if (request.method !== 'POST' || url.pathname !== '/api/assistant') return null;
  const body = validate(await readJson(request));
  const allowed = body.results
    ? typeof body.ticket === 'string' && body.ticket === await proof(body, body.ticket)
    : await modelAllowed(body.accountId, env);
  const chosen = body.results && body.route ? body.route : await route(body, allowed ? env : undefined);
  const data = await answer(body, chosen, allowed ? env : undefined);
  const fallback = data.reply;
  if (fallback.needsSolve) {
    const next = { ...body, asked: fallback.needsSolve, route: chosen };
    return json({ ...fallback, route: chosen, ticket: allowed ? await proof(next) : undefined });
  }
  const keepOut = chosen.action === 'swap-product' && !fallback.results;
  if (chosen.action === 'medical' || chosen.action === 'off-topic' || fallback.paywall || keepOut) {
    return json(fallback);
  }
  if (!allowed) {
    return json({ ...fallback, note: 'AI unavailable or daily limit reached; checked template.' });
  }
  try {
    const text = await writeAnswer(body.message, chosen.action, data.facts, env, chosen.args.topic);
    const kind = fallback.results?.length === 1
      ? fallback.results[0].ok ? 'fits' : 'does-not-fit' : 'facts';
    const checked = chosen.action === 'compare'
      ? verifyComparison(text, data.facts) : verify(text, data.facts, kind, data.names);
    if (checked) return json({ ...fallback, text, source: 'model' });
    return json({ ...fallback, note: 'AI draft failed the fact check; checked template.' });
  } catch {
    return json({ ...fallback, note: 'AI model unavailable; checked template.' });
  }
}
