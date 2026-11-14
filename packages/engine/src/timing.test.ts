import { test } from 'vitest';
import { solve, fixtureCatalog, fixtureRecipes, fixtureInputs } from './index';

test('timing', () => {
  const cases = {
    normal: fixtureInputs,
    low40: { ...fixtureInputs, budget: 40 },
    low60: { ...fixtureInputs, budget: 60 },
    protein220: { ...fixtureInputs, proteinPerDay: 220 },
    workout: { ...fixtureInputs, workouts: [{ day: 1, start: '18:00', kind: 'strength' as const, minutes: 60 }] },
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
