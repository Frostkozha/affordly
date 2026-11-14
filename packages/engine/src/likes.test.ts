import { beforeAll, expect, it } from 'vitest';
import catalogJson from '../../../data/catalog.json';
import recipesJson from '../../../data/recipes.json';
import type { Catalog, Recipe } from './types';
import { initEngine } from './lp';
import { fixtureInputs } from './fixtures';
import { findPlan } from './optimize';
import { verify } from './verify';

beforeAll(() => initEngine());
const catalog = catalogJson as Catalog;
const recipes = recipesJson as Recipe[];

it('prefers liked dinners within all hard limits and honors exclusions', () => {
  const inputs = { ...fixtureInputs, budget: 100 };
  const likedRecipeIds = ['black-bean-quesadillas', 'mac-and-beans-medley'];
  const baseline = findPlan(inputs, catalog, recipes, []);
  const changed = { ...inputs, likedRecipeIds };
  const liked = findPlan(changed, catalog, recipes, []);
  expect(baseline).not.toBeNull();
  expect(liked).not.toBeNull();
  if (!baseline || !liked) return;
  for (const id of likedRecipeIds) {
    const count = liked.meals.filter(m => m.recipeId === id).length;
    expect(count).toBeGreaterThanOrEqual(baseline.meals.filter(m => m.recipeId === id).length);
    expect(count).toBeGreaterThanOrEqual(1);
  }
  expect(verify(liked, changed, catalog, recipes, []).ok).toBe(true);
  expect(Math.max(...liked.basket.map(line => line.packages))).toBeLessThanOrEqual(6);
  const excluded = { ...changed, excludedRecipeIds: [likedRecipeIds[0]] };
  const plan = findPlan(excluded, catalog, recipes, []);
  expect(plan).not.toBeNull();
  if (!plan) return;
  expect(plan.meals.some(m => m.recipeId === likedRecipeIds[0])).toBe(false);
  expect(verify(plan, excluded, catalog, recipes, []).ok).toBe(true);
}, 30000);
