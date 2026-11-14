import { describe, it, expect, vi } from 'vitest';
import type { AssistantRequest, AssistantResponse } from '../../../packages/engine/src/api';
import type { Plan, Inputs, SolveResult } from '../../../packages/engine/src/types';
import type { Env } from '../http';
import catalog from '../../../data/catalog.json';
import recipes from '../../../data/recipes.json';
import { route, ruleRoute, validRoute, type Route } from './route';
import { answer, scenarios } from './actions';
import { verify, verifyComparison } from './verify';
import { model } from './model';
import { modelAllowed } from './quota';
import { assistant } from './index';

const inputs: Inputs = {
  budget: 80, kcalPerDay: 2000, proteinPerDay: 120, maxCookMinutes: 45,
  avoid: [], workouts: [], excludedProductIds: [], excludedRecipeIds: [],
};
const product = catalog.products[0];
const recipe = recipes[0];
const plan: Plan = {
  meals: Array.from({ length: 21 }, (_, i) => ({ day: Math.floor(i / 3), slot: 'dinner',
    recipeId: recipe.id, servings: 1, time: '19:00' })),
  basket: [{ productId: product.id, gramsNeeded: 100, gramsFromPantry: 0, packages: 1,
    cost: 71.4, gramCost: 60, gramsLeft: 200 }],
  basketCost: 71.4, gramCost: 60, checkoutGap: 11.4,
  days: [], average: { kcal: 2000, protein: 123, carbs: 200, fat: 70 },
  pantryAfter: [{ productId: recipe.ingredients[0].productId, grams: 100, daysLeft: null }],
  perishableLeftValue: 0, pantryUsedValue: 0,
};
const feasible: SolveResult = { ok: true, plan };
const impossible: SolveResult = { ok: false, reason: 'No plan fits $60.', alternatives: [
  { kind: 'min-budget', headline: 'Raise budget to $71.40', inputs, plan },
] };
const body: AssistantRequest = {
  accountId: 'a'.repeat(32), message: '$80', inputs, pantry: [], plan, plus: true,
};
const routes: Route[] = [
  { action: 'change-inputs', args: { budget: 90 } },
  { action: 'compare', args: { scenarios: [{ budget: 80 }, { budget: 90 }] } },
  { action: 'swap-product', args: { productId: product.id } },
  { action: 'like-recipe', args: { recipeId: recipe.id } },
  { action: 'dislike-recipe', args: { recipeId: recipe.id } },
  { action: 'add-workout', args: { day: 1, start: '18:00', kind: 'mixed', minutes: 60 } },
  { action: 'explain-plan', args: { topic: 'gap' } },
  { action: 'price-lookup', args: { productIds: [product.id] } },
  { action: 'find-recipes', args: { query: 'dinner' } },
  { action: 'how-to-cook', args: { recipeId: recipe.id } },
  { action: 'use-leftovers', args: {} },
  { action: 'off-topic', args: {} },
  { action: 'medical', args: {} },
];
const fake = (run: Env['AI']['run']) => ({ AI: { run } }) as Env;

 describe('strict router schema', () => {
  it.each(routes)('accepts $action', r => expect(validRoute(r)).toBe(true));
  it.each([
    null, {}, { action: 'unknown', args: {} },
    { action: 'change-inputs', args: { budget: 19 } },
    { action: 'change-inputs', args: { budget: 401 } },
    { action: 'change-inputs', args: { kcalPerDay: 4501 } },
    { action: 'change-inputs', args: { proteinPerDay: '180' } },
    { action: 'change-inputs', args: { maxRepeats: 2.5 } },
    { action: 'change-inputs', args: { avoidAdd: ['shellfish'] } },
    { action: 'swap-product', args: { productId: 'unknown' } },
    { action: 'like-recipe', args: { recipeId: 'unknown' } },
    { action: 'price-lookup', args: { productIds: [] } },
    { action: 'compare', args: { scenarios: [{}, {}, {}, {}] } },
    { action: 'add-workout', args: { day: 7, start: '18:00', kind: 'mixed', minutes: 60 } },
    { action: 'add-workout', args: { day: 1, start: '25:00', kind: 'mixed', minutes: 60 } },
    { action: 'find-recipes', args: { query: 'food', mealType: 'brunch' } },
    { action: 'off-topic', args: { injected: true } },
  ])('rejects invalid route %#', r => expect(validRoute(r)).toBe(false));
  it('routes free text and includes capped conversation and identifiers in prompt', async () => {
    const run = vi.fn(async () => ({ response: JSON.stringify(routes[3]) }));
    const history = [{ role: 'user' as const, text: 'Cuban beans please' }];
    expect(await route({ ...body, message: 'I love the beans recipe', history }, fake(run))).toEqual(routes[3]);
    const prompt = JSON.stringify(run.mock.calls);
    expect(prompt).toContain(recipe.id);
    expect(prompt).toContain(product.id);
    expect(prompt).toContain('Cuban beans please');
  });
  it.each(['not json', '{"action":"swap-product","args":{"productId":"unknown"}}'])
    ('falls back safely with history after invalid JSON', async response => {
      const b = { ...body, message: 'and without dairy?',
        history: [{ role: 'assistant' as const, text: 'Previously discussed chicken' }] };
      expect(await route(b, fake(async () => ({ response })))).toEqual(ruleRoute(b));
    });
  it('falls back safely when both models fail', async () => {
    const run = vi.fn(async () => { throw new Error('offline'); });
    const b = { ...body, message: 'make it cheaper', history: [] };
    expect(await route(b, fake(run))).toEqual(ruleRoute(b));
    expect(run).toHaveBeenCalledTimes(2);
  });
  it.each(['$70', 'no fish', 'No tuna this week', 'Tell me a joke', 'Meals during pregnancy?'])
    ('avoids model for obvious or refused message %s', async message => {
      const run = vi.fn(async () => ({ response: '' }));
      await route({ ...body, message }, fake(run));
      expect(run).not.toHaveBeenCalled();
    });
});

describe('action facts and templates', () => {
  it.each(routes)('$action has grounded facts and rejects invented numbers', async r => {
    const asked = scenarios(body, r);
    const results = asked.map(() => feasible);
    const data = await answer({ ...body, asked, results }, r);
    expect(data.reply.action).toBe(r.action);
    expect(data.reply.text.length).toBeGreaterThan(0);
    expect(data.reply.suggestions.length).toBeGreaterThanOrEqual(2);
    expect(verify(data.reply.text, data.facts, 'facts', data.names)).toBe(true);
    expect(verify(data.reply.text + ' It costs $987.65.', data.facts, 'facts', data.names)).toBe(false);
  });
  it('keeps comparison order and only offers feasible scenarios', async () => {
    const r = routes[1];
    const asked = scenarios(body, r);
    const data = await answer({ ...body, asked, results: [impossible, feasible] }, r);
    expect(data.reply.results).toEqual([impossible, feasible]);
    expect(data.reply.options).toEqual([{ label: 'Apply Scenario 2', inputs: asked[1] }]);
    expect(data.facts).toContain('Solver minimum receipt: $71.40');
    expect(data.facts).toContain('Scenario 2: fits. Receipt $71.40');
  });
  it('covers required local fallback questions without an AI binding', async () => {
    const messages = ['$70', 'No tuna this week', 'Why is my gap so big?',
      'Explain my plan', 'Find a quick dinner', 'Tell me a joke'];
    const actions = ['change-inputs', 'swap-product', 'explain-plan',
      'explain-plan', 'find-recipes', 'off-topic'];
    for (const [index, message] of messages.entries()) {
      const r = ruleRoute({ ...body, message });
      expect(r.action).toBe(actions[index]);
      const data = await answer({ ...body, message }, r);
      expect(data.reply.needsSolve?.length || data.reply.text.length).toBeGreaterThan(0);
      if (r.action === 'swap-product') expect(r.args.productId).toBe('canned-tuna');
    }
  });
  it('updates exclusions, likes and workouts without mutating inputs', () => {
    expect(scenarios(body, routes[2])[0].excludedProductIds).toContain(product.id);
    expect(scenarios(body, routes[3])[0].likedRecipeIds).toContain(recipe.id);
    expect(scenarios(body, routes[4])[0].excludedRecipeIds).toContain(recipe.id);
    expect(scenarios(body, routes[5])[0].workouts[0].start).toBe('18:00');
    expect(inputs.excludedProductIds).toEqual([]);
    expect(inputs.workouts).toEqual([]);
  });
  it('gates workout solving behind Plus', async () => {
    const data = await answer({ ...body, plus: false }, routes[5]);
    expect(data.reply.paywall).toBe(true);
    expect(data.reply.needsSolve).toBeUndefined();
  });
  it('filters recipe retrieval before selecting results', async () => {
    const data = await answer(body, { action: 'find-recipes',
      args: { query: 'dinner', mealType: 'dinner', maxMinutes: 30, minProtein: 30 } });
    expect(data.reply.recipeIds.length).toBeGreaterThan(0);
    for (const id of data.reply.recipeIds) {
      const r = recipes.find(r => r.id === id)!;
      expect(r.mealTypes).toContain('dinner');
      expect(r.cookMinutes).toBeLessThanOrEqual(30);
      expect(r.perServing.protein).toBeGreaterThanOrEqual(30);
    }
  });
  it('scales cooking ingredients to one portion and includes source and steps', async () => {
    const data = await answer(body, routes[9]);
    expect(data.facts).toContain((recipe.ingredients[0].grams / recipe.servings).toFixed(1));
    expect(data.facts).toContain(recipe.steps[0]);
    expect(data.facts).toContain(recipe.source.url);
  });
  it('checks comparisons against the corresponding scenario and feasibility', () => {
    const facts = 'Scenario 1: does not fit. Minimum $71.40.\n'
      + 'Scenario 2: fits. Receipt $81.40.';
    expect(verifyComparison(facts, facts)).toBe(true);
    expect(verifyComparison('Scenario 1: fits. Receipt $71.40.\n'
      + 'Scenario 2: fits. Receipt $81.40.', facts)).toBe(false);
    expect(verifyComparison('Scenario 1: does not fit. Minimum $81.40.\n'
      + 'Scenario 2: fits. Receipt $71.40.', facts)).toBe(false);
  });
  it('requires product and recipe names and no longer whitelists arbitrary small numbers', () => {
    expect(verify('It costs $4.', 'Receipt $71.40', 'facts')).toBe(false);
    expect(verify('Try dinner.', 'Facts', 'facts', [recipe.name])).toBe(false);
    expect(verify('A product.', 'Facts', 'facts', [product.name])).toBe(false);
    expect(verify('Yes, it fits.', 'Plan fits: no', 'does-not-fit')).toBe(false);
  });
});

describe('model adapter and two-step quota', () => {
  it('preserves the daily boundary and disables AI on quota failures', async () => {
    for (const [row, allowed] of [[{ count: 40 }, true], [null, false]] as const) {
      const env = { DB: { prepare: () => ({ bind() { return this; }, first: async () => row }) } };
      expect(await modelAllowed(body.accountId, env as unknown as Env)).toBe(allowed);
    }
  });
  it('uses configured model, retries on errors and accepts OpenAI shape', async () => {
    const run = vi.fn().mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce({ choices: [{ message: { content: 'checked' } }] });
    const env = { ...fake(run), ASSISTANT_MODEL: 'custom' };
    expect(await model(env, [], 0)).toBe('checked');
    expect(run.mock.calls[0][0]).toBe('custom');
    expect(run.mock.calls[1][0]).toContain('llama-3.1-8b');
  });
  const url = new URL('https://example.com/api/assistant');
  const request = (b: unknown) => new Request(url, { method: 'POST', body: JSON.stringify(b) });
  it('counts one unit for route plus writer across a solver continuation', async () => {
    const first = vi.fn(async () => ({ count: 1 }));
    const run = vi.fn(async () => ({ response: 'Receipt $71.40.' }));
    const env = { ...fake(run), DB: { prepare: () => ({ bind() { return this; }, first }) } } as unknown as Env;
    const step = await (await assistant(request(body), env, url))!.json() as AssistantResponse;
    const result = await assistant(request({ ...body, asked: step.needsSolve, results: [feasible],
      route: step.route, ticket: step.ticket }), env, url);
    expect(await result!.json()).toMatchObject({ source: 'model', results: [feasible] });
    expect(first).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledTimes(1);
  });
  it('rechecks every comparison result and every alternative receipt', async () => {
    const bad = { ok: true, plan: { ...plan, basketCost: 72 } };
    for (const results of [[feasible, bad], [feasible, { ...impossible,
      alternatives: [{ ...impossible.alternatives[0], plan: { ...plan, checkoutGap: 3 } }] }]]) {
      await expect(assistant(request({ ...body, asked: [inputs, inputs], results }), fake(vi.fn()), url))
        .rejects.toMatchObject({ status: 400 });
    }
  });
});
