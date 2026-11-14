import { beforeAll } from 'vitest';
import { initEngine } from './lp';
beforeAll(() => initEngine());
import { test } from 'vitest';
import { solve, fixtureInputs } from './index';
import catalogJson from '../../../data/catalog.json';
import recipesJson from '../../../data/recipes.json';
import type { Catalog, Recipe } from './types';
const fixtureCatalog = catalogJson as Catalog, fixtureRecipes = recipesJson as Recipe[];

test('timing', () => {
  const cases = {
    normal: fixtureInputs,
    b100: { ...fixtureInputs, budget: 100 },
    low40: { ...fixtureInputs, budget: 40 },
    p120: { ...fixtureInputs, proteinPerDay: 120 },
    kcal1800: { ...fixtureInputs, kcalPerDay: 1800, proteinPerDay: 110, budget: 70 },
    nofish: { ...fixtureInputs, budget: 100, avoid: ['fish', 'dairy'] },
    low60: { ...fixtureInputs, budget: 60 },
    protein220: { ...fixtureInputs, proteinPerDay: 220 },
    workout: { ...fixtureInputs, budget: 100, workouts: [{ day: 1, start: '18:00', kind: 'strength' as const, minutes: 60 }] },
  };
  for (const [name, inputs] of Object.entries(cases)) {
    const t = performance.now();
    const r = solve(inputs, fixtureCatalog, fixtureRecipes, []);
    const ms = Math.round(performance.now() - t);
    console.log(name, ms + 'ms', r.ok
      ? `ok $${r.plan.basketCost} gap $${r.plan.checkoutGap} protein ${Math.round(r.plan.average.protein)}`
      : `NO: ${r.reason} | ${r.alternatives.map(a => a.headline).join(' | ')}`);
  }
}, 120000);
