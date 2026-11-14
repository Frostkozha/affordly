import type { AssistantRequest } from '../../../packages/engine/src/api';
import { HttpError, json, readJson, type Env } from '../http';
import { classify } from './classify';
import { parse, avoidTags } from './parse';
import { retrieve } from './retrieve';
import { facts, template } from './templates';
import { generate } from './generate';
import { verify } from './verify';

type Shape = string | { [key: string]: Shape } | [Shape];
const macros = { kcal: 'number', protein: 'number', carbs: 'number', fat: 'number' };
const pantry: Shape = [{ productId: 'string', grams: 'number', daysLeft: 'nullable-number' }];
const inputs: Shape = {
  budget: 'number', kcalPerDay: 'number', proteinPerDay: 'number', maxCookMinutes: 'number',
  avoid: ['string'], excludedProductIds: ['string'], excludedRecipeIds: ['string'],
  workouts: [{ day: 'number', start: 'string', kind: 'string', minutes: 'number' }],
};
const plan: Shape = {
  meals: [{ day: 'number', slot: 'string', time: 'string', recipeId: 'string', servings: 'number' }],
  basket: [{ productId: 'string', gramsNeeded: 'number', gramsFromPantry: 'number', packages: 'number', cost: 'number', gramCost: 'number', gramsLeft: 'number' }],
  basketCost: 'number', gramCost: 'number', checkoutGap: 'number', days: [macros], average: macros,
  pantryAfter: pantry, perishableLeftValue: 'number', pantryUsedValue: 'number',
};

function matches(value: unknown, shape: Shape): boolean {
  if (shape === 'nullable-number') return value === null || matches(value, 'number');
  if (shape === 'number') return typeof value === 'number' && Number.isFinite(value) && value >= 0;
  if (shape === 'string') return typeof value === 'string' && value.length <= 1000;
  if (Array.isArray(shape)) return Array.isArray(value) && value.length <= 200 && value.every(v => matches(v, shape[0]));
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.entries(shape).every(([key, spec]) => matches((value as Record<string, unknown>)[key], spec));
}

function validInputs(value: unknown): boolean {
  if (!matches(value, inputs)) return false;
  const i = value as AssistantRequest['inputs'];
  return i.budget >= 20 && i.budget <= 400 && i.kcalPerDay >= 1200 && i.kcalPerDay <= 4500 && i.proteinPerDay >= 40 && i.proteinPerDay <= 300 && i.maxCookMinutes >= 10 && i.maxCookMinutes <= 120 && i.avoid.every(t => avoidTags.includes(t)) && i.workouts.length <= 7 && i.workouts.every(w => Number.isInteger(w.day) && w.day <= 6 && /^([01]\d|2[0-3]):[0-5]\d$/.test(w.start) && ['strength', 'cardio', 'mixed'].includes(w.kind));
}

function validate(value: unknown): AssistantRequest {
  const b = value as AssistantRequest | null;
  if (!b || typeof b.message !== 'string' || !b.message.trim() || b.message.length > 500 || !validInputs(b.inputs) || !matches(b.pantry, pantry)) throw new HttpError(400, 'Invalid assistant request');
  if (b.asked !== undefined && !validInputs(b.asked)) throw new HttpError(400, 'Invalid asked inputs');
  if (b.result !== undefined) {
    const r = b.result;
    const valid = r?.ok === true ? matches(r.plan, plan) : r?.ok === false && typeof r.reason === 'string' && r.reason.length <= 1000 && Array.isArray(r.alternatives) && r.alternatives.length <= 3 && r.alternatives.every(a => a && ['min-budget', 'max-protein', 'more-cook-time'].includes(a.kind) && typeof a.headline === 'string' && a.headline.length <= 500 && validInputs(a.inputs) && matches(a.plan, plan));
    if (!b.asked || !valid) throw new HttpError(400, 'Invalid solver result');
  }
  return b;
}

async function modelAllowed(accountId: unknown, env: Env): Promise<boolean> {
  if (typeof accountId !== 'string' || !/^[a-f0-9]{32}$/i.test(accountId)) return false;
  try {
    const row = await env.DB.prepare('INSERT INTO usage (account_id, day, count) VALUES (?, ?, 1) ON CONFLICT(account_id, day) DO UPDATE SET count = count + 1 WHERE count < 40 RETURNING count')
      .bind(accountId.toLowerCase(), new Date().toISOString().slice(0, 10)).first<{ count: number }>();
    return !!row && row.count <= 40;
  } catch {
    return false;
  }
}

export async function assistant(request: Request, env: Env, url: URL): Promise<Response | null> {
  if (request.method !== 'POST' || url.pathname !== '/api/assistant') return null;
  const body = validate(await readJson(request));
  const allowed = await modelAllowed(body.accountId, env);
  const ai = allowed ? env : undefined;
  const intent = await classify(body.message, ai);
  const asked = body.asked ?? parse(body.message, body.inputs);
  if ((intent === 'budget' || intent === 'plan-change') && !body.result) return json(template(intent, asked));
  const recipes = intent === 'medical' || intent === 'off-topic' ? [] : await retrieve(body.message, asked, ai);
  const fallback = template(intent, asked, body.result, recipes);
  if (!allowed || intent === 'medical' || intent === 'off-topic') return json(fallback);
  const data = facts(asked, body.result, recipes);
  try {
    const text = await generate(body.message, data, env);
    if (verify(text, data, body.result?.ok === false)) return json({ ...fallback, text, source: 'model' });
  } catch { /* Keep the deterministic answer when generation is unavailable. */ }
  return json(fallback);
}
