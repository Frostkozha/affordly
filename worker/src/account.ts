import type { AccountState, AccountResponse } from '../../packages/engine/src/api';
import { HttpError, json, readJson, type Env } from './http';

type Shape = 'string' | 'number' | 'boolean' | readonly string[] | { [key: string]: Shape } | { array: Shape } | { nullable: Shape };
const strings: Shape = { array: 'string' };
const likedStrings: Shape = { array: 'string' };
const macros: Shape = { kcal: 'number', protein: 'number', carbs: 'number', fat: 'number' };
const pantry: Shape = { array: { productId: 'string', grams: 'number', daysLeft: { nullable: 'number' } } };
const stateShape: Shape = {
  inputs: { nullable: {
    budget: 'number', kcalPerDay: 'number', proteinPerDay: 'number', maxCookMinutes: 'number',
    avoid: strings, excludedProductIds: strings, excludedRecipeIds: strings, likedRecipeIds: likedStrings, maxRepeats: 'number',
    workouts: { array: { day: 'number', start: 'string', kind: ['strength', 'cardio', 'mixed'], minutes: 'number' } },
  } },
  pantry, week: 'number', plus: 'boolean',
  history: { array: { week: 'number', basketCost: 'number', checkoutGap: 'number', pantryUsedValue: 'number' } },
  currentPlan: { nullable: {
    meals: { array: { day: 'number', slot: ['breakfast', 'lunch', 'dinner', 'pre-workout', 'post-workout'], time: 'string', recipeId: 'string', servings: 'number' } },
    basket: { array: { productId: 'string', gramsNeeded: 'number', gramsFromPantry: 'number', packages: 'number', cost: 'number', gramCost: 'number', gramsLeft: 'number' } },
    basketCost: 'number', gramCost: 'number', checkoutGap: 'number', days: { array: macros }, average: macros,
    pantryAfter: pantry, perishableLeftValue: 'number', pantryUsedValue: 'number',
  } },
};

function clean(value: unknown, shape: Shape): unknown {
  const invalid = () => { throw new HttpError(400, 'Invalid account state'); };
  if (typeof shape === 'string') {
    if (typeof value !== shape || (shape === 'number' && !Number.isFinite(value))) invalid();
    return value;
  }
  if (Array.isArray(shape)) { if (!shape.includes(value as string)) invalid(); return value; }
  const spec = shape as Record<string, Shape>;
  if ('nullable' in spec) return value === null ? null : clean(value, spec.nullable!);
  if ('array' in spec) {
    if (!Array.isArray(value)) return invalid();
    if (spec.array === 'string' && value.length > 60) return invalid();
    if (shape === likedStrings && value.some(v => typeof v !== 'string' || v.length > 80)) {
      return invalid();
    }
    return value.map(v => clean(v, spec.array!));
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  const object = value as Record<string, unknown>;
  return Object.fromEntries(Object.entries(spec).map(([key, type]) => {
    // Fields added after launch are optional in stored states: fill their defaults.
    const defaults: Record<string, unknown> = { likedRecipeIds: [], maxRepeats: 3 };
    const field = object[key] === undefined && key in defaults ? defaults[key] : object[key];
    return [key, clean(field, type)];
  }));
}

interface Row { id: string; restore_code: string; created_at: string; state: string }
function result(row: Row): AccountResponse {
  return { id: row.id, restoreCode: row.restore_code, createdAt: row.created_at, state: JSON.parse(row.state) as AccountState };
}
function randomCode(): string {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  // Rejection sampling avoids modulo bias for the 31-character alphabet.
  let code = '';
  while (code.length < 10) {
    for (const byte of crypto.getRandomValues(new Uint8Array(16))) {
      if (byte < Math.floor(256 / alphabet.length) * alphabet.length) code += alphabet[byte % alphabet.length];
      if (code.length === 10) break;
    }
  }
  return code;
}
export async function account(request: Request, env: Env, url: URL): Promise<Response | null> {
  const path = url.pathname;
  if (path === '/api/account' && request.method === 'POST') {
    const state: AccountState = { inputs: null, pantry: [], week: 1, history: [], plus: false, currentPlan: null };
    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
    const now = new Date().toISOString();
    // Retry the extremely unlikely restore-code collision without hiding DB failures.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = randomCode();
      const inserted = await env.DB.prepare('INSERT INTO accounts (id, restore_code, created_at, updated_at, state) VALUES (?, ?, ?, ?, ?) ON CONFLICT(restore_code) DO NOTHING')
        .bind(id, code, now, now, JSON.stringify(state)).run();
      if (inserted.meta.changes) return json({ id, restoreCode: code, createdAt: now, state }, 201);
    }
    throw new HttpError(503, 'Account creation unavailable');
  }
  if (path === '/api/account/restore' && request.method === 'POST') {
    const body = await readJson(request) as { code?: unknown } | null;
    if (!body || typeof body.code !== 'string' || !/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{10}$/.test(body.code)) throw new HttpError(404, 'Account not found');
    const row = await env.DB.prepare('SELECT id, restore_code, created_at, state FROM accounts WHERE restore_code = ?').bind(body.code).first<Row>();
    if (!row) throw new HttpError(404, 'Account not found');
    return json(result(row));
  }
  const match = /^\/api\/account\/([^/]+)$/.exec(path);
  if (!match || !['GET', 'PUT'].includes(request.method)) return null;
  const id = match[1]!;
  if (!/^[a-fA-F0-9]{32}$/.test(id)) throw new HttpError(400, 'Invalid account id');
  if (request.method === 'GET') {
    const row = await env.DB.prepare('SELECT id, restore_code, created_at, state FROM accounts WHERE id = ?').bind(id.toLowerCase()).first<Row>();
    if (!row) throw new HttpError(404, 'Account not found');
    return json(result(row));
  }
  const state = clean(await readJson(request), stateShape);
  const updated = await env.DB.prepare('UPDATE accounts SET state = ?, updated_at = ? WHERE id = ?').bind(JSON.stringify(state), new Date().toISOString(), id.toLowerCase()).run();
  if (!updated.meta.changes) throw new HttpError(404, 'Account not found');
  return json({ ok: true });
}
