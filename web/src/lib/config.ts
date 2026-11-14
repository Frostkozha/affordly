// Product settings shared by the screens. Plans and prices never live here: they come from the engine.
import type { Inputs } from '@affordly/engine';

export const defaultInputs: Inputs = {
  budget: 95,
  kcalPerDay: 2200,
  proteinPerDay: 150,
  maxCookMinutes: 30,
  avoid: [],
  workouts: [],
  excludedProductIds: [],
  excludedRecipeIds: [],
};

export const demoTerms = { freeSwaps: 3, monthly: 7.99, yearly: 59.99 };
