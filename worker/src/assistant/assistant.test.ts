import { describe, expect, it, vi } from 'vitest';
import type { Inputs, Plan, SolveResult } from '../../../packages/engine/src/types';
import type { Env } from '../http';
import { classify } from './classify';
import { parse } from './parse';
import { facts, template } from './templates';
import { verify } from './verify';
import { assistant } from './index';
import { retrieve } from './retrieve';

const inputs: Inputs = { budget: 80, kcalPerDay: 2000, proteinPerDay: 120, maxCookMinutes: 45, avoid: [], workouts: [], excludedProductIds: [], excludedRecipeIds: [] };
const plan: Plan = { meals: [], basket: [], basketCost: 71.4, gramCost: 60, checkoutGap: 11.4, days: [], average: { kcal: 2001, protein: 123, carbs: 200, fat: 70 }, pantryAfter: [], perishableLeftValue: 0, pantryUsedValue: 0 };
const feasible: SolveResult = { ok: true, plan };
const infeasible: SolveResult = { ok: false, reason: 'No plan fits $60.', alternatives: [{ kind: 'min-budget', headline: 'Raise the budget to $71.40', inputs: { ...inputs, budget: 71.4 }, plan }] };
const ai = vi.fn(async () => ({ response: 'off-topic' }));
const env = { AI: { run: ai }, DB: { prepare: () => ({ bind() { return this; }, first: async () => ({ count: 1 }) }) } } as unknown as Env;

describe('classify', () => {
  it.each([
    ['$60 for the week', 'budget'], ['Can I afford this?', 'budget'], ['Make it cheaper', 'budget'],
    ['Set protein to 180 g', 'plan-change'], ['I want no fish', 'plan-change'], ['Change workout meals', 'plan-change'],
    ['What can I eat?', 'recipe'], ['How do I cook dinner?', 'recipe'], ['Meals during pregnancy?', 'medical'], ['Tell me a joke', 'off-topic'],
  ])('%s -> %s', async (message, intent) => {
    expect(await classify(message, env)).toBe(intent);
  });
  it('falls back when classification fails', async () => {
    expect(await classify('hello', { AI: { run: async () => { throw new Error('offline'); } } } as unknown as Env)).toBe('off-topic');
  });
});

describe('parse', () => {
  it.each([
    ['$60', { budget: 60 }], ['60 dollars and 180 g protein', { budget: 60, proteinPerDay: 180 }],
    ['2000 kcal and 45 minutes', { kcalPerDay: 2000, maxCookMinutes: 45 }],
    ['no fish without dairy', { avoid: ['fish', 'dairy'] }],
    ['vegetarian', { avoid: ['meat', 'poultry', 'pork', 'fish'] }],
    ['$2 9000 calories 500 grams protein 300 minutes', { budget: 20, kcalPerDay: 4500, proteinPerDay: 300, maxCookMinutes: 120 }],
  ])('%s', (message, expected) => {
    expect(parse(message, inputs)).toMatchObject(expected);
    expect(inputs.avoid).toEqual([]);
  });
  it('keeps current inputs when no values can be parsed', () => {
    expect(parse('Can this budget work?', inputs)).toEqual(inputs);
  });
});

describe('templates and verifier', () => {
  it('reports feasible receipt and proposes asked inputs', () => {
    const reply = template('budget', inputs, feasible);
    expect(reply.text).toBe('Yes: this fits. Receipt $71.40 of $80.00 budget; recipe price $60.00; Checkout Gap $11.40; 123 g protein and 2001 kcal a day on average.');
    expect(reply.proposedInputs).toEqual(inputs);
    expect(reply.refused).toBe(false);
    expect(verify(reply.text, facts(inputs, feasible, []), false)).toBe(true);
  });
  it('reports solver reason and alternatives with the minimum budget', () => {
    const reply = template('budget', inputs, infeasible);
    expect(reply.text).toBe('No plan fits $60.\nRaise the budget to $71.40');
    expect(reply.refused).toBe(true);
    expect(reply.proposedInputs?.budget).toBe(71.4);
  });
  it('rejects changed dollars and affirmative infeasible answers', () => {
    expect(verify('Receipt $71.41.', facts(inputs, feasible, []), false)).toBe(false);
    expect(verify('Yes, you can do it for $60.', facts(inputs, infeasible, []), true)).toBe(false);
    expect(verify('Average 2,001 kcal.', facts(inputs, feasible, []), false)).toBe(true);
  });
});

describe('route and retrieval', () => {
  const url = new URL('https://example.com/api/assistant');
  const request = (body: unknown) => new Request(url, { method: 'POST', body: JSON.stringify(body) });
  it('returns step one without generation', async () => {
    ai.mockClear();
    const response = await assistant(request({ message: '$60', inputs, pantry: [] }), env, url);
    expect(await response?.json()).toMatchObject({ needsSolve: { budget: 60 }, text: '', source: 'template' });
    expect(ai).not.toHaveBeenCalled();
  });
  it('rejects oversized messages and malformed results', async () => {
    await expect(assistant(request({ message: 'x'.repeat(501), inputs, pantry: [] }), env, url)).rejects.toMatchObject({ status: 400 });
    await expect(assistant(request({ message: '$60', inputs, pantry: [], asked: inputs, result: { ok: true } }), env, url)).rejects.toMatchObject({ status: 400 });
  });
  it('uses templates on rate limit or D1 failure', async () => {
    for (const first of [async () => null, async () => { throw new Error('D1 unavailable'); }]) {
      ai.mockClear();
      const limited = { ...env, DB: { prepare: () => ({ bind() { return this; }, first }) } } as unknown as Env;
      const response = await assistant(request({ accountId: 'a'.repeat(32), message: '$60', inputs, pantry: [], asked: inputs, result: infeasible }), limited, url);
      expect(await response?.json()).toMatchObject({ source: 'template', refused: true });
      expect(ai).not.toHaveBeenCalled();
    }
  });
  it('falls back to keywords and filters avoided tags and time', async () => {
    const failing = { AI: { run: async () => { throw new Error('offline'); } } } as unknown as Env;
    const found = await retrieve('breakfast oats', { ...inputs, avoid: ['fish', 'dairy'], maxCookMinutes: 20 }, failing);
    expect(found.length).toBeLessThanOrEqual(3);
    expect(found.every(r => r.cookMinutes <= 20 && !r.contains.some(t => ['fish', 'dairy'].includes(t)))).toBe(true);
  });
  it('keeps structured solver fields when accepting model text and rejects invented numbers', async () => {
    for (const [text, source] of [['Receipt $71.40.', 'model'], ['Receipt $71.41.', 'template']]) {
      const generated = { ...env, AI: { run: async (model: string) => {
        if (model.includes('bge')) throw new Error('No embeddings');
        return { response: text };
      } } } as Env;
      const response = await assistant(request({ accountId: 'a'.repeat(32), message: '$80', inputs, pantry: [], asked: inputs, result: feasible }), generated, url);
      expect(await response?.json()).toMatchObject({ source, refused: false, proposedInputs: inputs, result: feasible });
    }
  });
  it('batches and caches recipe embeddings while embedding each query', async () => {
    const batches: string[][] = [];
    const dense = { AI: { run: async (_model: string, body: { text: string[] }) => {
      batches.push(body.text);
      return { data: body.text.map(() => [1, 0]) };
    } } } as unknown as Env;
    const first = await retrieve('breakfast', inputs, dense);
    await retrieve('dinner', inputs, dense);
    expect(first).toHaveLength(3);
    expect(batches.filter(b => b.length > 1)).toHaveLength(1);
    expect(batches.filter(b => b.length === 1)).toHaveLength(2);
  });
});
