// data/sample-plan.json is the solved plan for the default inputs, shipped so the landing page and
// "Try with sample" show at once instead of waiting for the solver. This test fails when it goes stale.
// Refresh it with: UPDATE_SAMPLE=1 npx vitest run packages/engine/src/sample.test.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { beforeAll, expect, test } from 'vitest';
import { initEngine } from './lp';
import { solve } from './index';
import catalogJson from '../../../data/catalog.json';
import recipesJson from '../../../data/recipes.json';
import { defaultInputs } from '../../../web/src/lib/config';
import type { Catalog, Recipe } from './types';

const file = new URL('../../../data/sample-plan.json', import.meta.url);
beforeAll(() => initEngine());

test('shipped sample plan equals a fresh solve of the default inputs', () => {
  const fresh = JSON.parse(JSON.stringify(solve(defaultInputs, catalogJson as Catalog, recipesJson as Recipe[], [])));
  expect(fresh.ok).toBe(true);
  if (process.env.UPDATE_SAMPLE) writeFileSync(file, JSON.stringify(fresh) + '\n');
  expect(JSON.parse(readFileSync(file, 'utf8'))).toEqual(fresh);
}, 60000);
