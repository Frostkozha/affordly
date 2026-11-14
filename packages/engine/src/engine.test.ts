import { beforeAll } from 'vitest';
import { initEngine } from './lp';
beforeAll(() => initEngine());
import { describe, expect, it } from 'vitest';
import { findPlan, solve } from './optimize';
import { verify } from './verify';
import { nextWeekPantry, swapProduct } from './pantry';
import { fixtureCatalog as catalog, fixtureRecipes as recipes, fixtureInputs as inputs } from './fixtures';

describe('meal engine', () => {
  it('builds and independently verifies a normal plan and receipt', () => {
    const result = solve(inputs, catalog, recipes, []);
    expect(result.ok, JSON.stringify(result)).toBe(true);
    if (!result.ok) return;
    expect(verify(result.plan, inputs, catalog, recipes, [])).toEqual({ ok: true, errors: [] });
    expect(result.plan.basketCost).toBeGreaterThanOrEqual(result.plan.gramCost);
    expect(result.plan.checkoutGap).toBeCloseTo(result.plan.basketCost - result.plan.gramCost, 2);
    expect(verify({ ...result.plan, basketCost: result.plan.basketCost + 1 }, inputs, catalog, recipes, []).ok).toBe(false);
  });
  it('offers a verified minimum budget and cannot solve one dollar below it', () => {
    const changed = { ...inputs, budget: 1 };
    const result = solve(changed, catalog, recipes, []);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const alternative = result.alternatives.find(a => a.kind === 'min-budget');
    expect(alternative).toBeDefined();
    if (!alternative) return;
    expect(alternative.inputs.budget).toBeGreaterThan(changed.budget);
    expect(verify(alternative.plan, alternative.inputs, catalog, recipes, []).ok).toBe(true);
    expect(solve({ ...inputs, budget: alternative.inputs.budget - 1 }, catalog, recipes, []).ok).toBe(false);
  });
  it('swaps a product without mutating inputs', () => {
    const changed = swapProduct(inputs, 'chicken-breast');
    const result = solve(changed, catalog, recipes, []);
    expect(inputs.excludedProductIds).toEqual([]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.plan.basket.some(l => l.productId === 'chicken-breast')).toBe(false);
  });
  it('carries leftovers into a cheaper next week', () => {
    const first = solve(inputs, catalog, recipes, []);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const pantry = nextWeekPantry(first.plan), second = solve(inputs, catalog, recipes, pantry);
    expect(second.ok).toBe(true);
    if (second.ok) {
      expect(second.plan.basketCost).toBeLessThan(first.plan.basketCost);
      expect(verify(second.plan, inputs, catalog, recipes, pantry).ok).toBe(true);
    }
    expect(nextWeekPantry({ ...first.plan, pantryAfter: [{ productId: 'milk', grams: 20, daysLeft: 7 }, { productId: 'rice', grams: 30, daysLeft: null }] })).toEqual([{ productId: 'rice', grams: 30, daysLeft: null }]);
  });
  it('places workout meals before and after the session', () => {
    const changed = { ...inputs, workouts: [{ day: 2, start: '17:00', kind: 'strength' as const, minutes: 60 }] };
    const result = solve(changed, catalog, recipes, []);
    expect(result.ok, JSON.stringify(result)).toBe(true);
    if (!result.ok) return;
    expect(verify(result.plan, changed, catalog, recipes, []).ok).toBe(true);
    const meals = result.plan.meals.filter(m => m.day === 2);
    expect(meals.find(m => m.slot === 'pre-workout')?.time).toBe('14:30');
    expect(meals.find(m => m.slot === 'post-workout')?.time).toBe('18:00');
  });
  it('rejects changed nutrition, coverage, repetition, and workout timing', () => {
    const result = solve(inputs, catalog, recipes, []);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const p = result.plan;
    expect(verify({ ...p, average: { ...p.average, protein: 999 } }, inputs, catalog, recipes, []).ok).toBe(false);
    expect(verify({ ...p, basket: p.basket.map((l,i) => i ? l : { ...l, gramsFromPantry: 9999 }) }, inputs, catalog, recipes, []).ok).toBe(false);
    expect(verify({ ...p, meals: p.meals.map(m => ({ ...m, recipeId: p.meals[0].recipeId })) }, inputs, catalog, recipes, []).ok).toBe(false);
    expect(verify(p, { ...inputs, excludedRecipeIds: [p.meals[0].recipeId] }, catalog, recipes, []).ok).toBe(false);
  });
  it('finds cooking and protein alternatives when those limits block', () => {
    const result = solve({ ...inputs, maxCookMinutes: 5 }, catalog, recipes, []);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.alternatives.some(a => a.kind === 'more-cook-time')).toBe(true);
      for (const a of result.alternatives) expect(verify(a.plan, a.inputs, catalog, recipes, []).ok).toBe(true);
    }
    const protein = solve({ ...inputs, proteinPerDay: 250 }, catalog, recipes, []);
    expect(protein.ok).toBe(false);
    if (!protein.ok) expect(protein.alternatives.some(a => a.kind === 'max-protein')).toBe(true);
  });
  it('keeps the minimum budget infeasible even one cent below', () => {
    const p = findPlan(inputs, catalog, recipes, [], true);
    expect(p).not.toBeNull();
    if (p) expect(findPlan({ ...inputs, budget: p.basketCost - .01 }, catalog, recipes, [])).toBeNull();
  });
  it('solves a 25 recipe and 40 product catalog within two seconds', () => {
    const expandedRecipes = Array.from({ length: 25 }, (_, i) => ({ ...recipes[i % recipes.length], id: `recipe-${i}` }));
    const expandedCatalog = { ...catalog, products: [...catalog.products, ...Array.from({ length: 26 }, (_, i) => ({ ...catalog.products[i % catalog.products.length], id: `extra-${i}` }))] };
    const start = Date.now(), result = solve(inputs, expandedCatalog, expandedRecipes, []);
    expect(result.ok).toBe(true);
    expect(Date.now() - start).toBeLessThan(2000);
  });
});
