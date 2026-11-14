import type { Inputs, PantryItem, Plan } from './types';

export function swapProduct(inputs: Inputs, productId: string): Inputs {
  return { ...inputs, excludedProductIds: [...new Set([...inputs.excludedProductIds, productId])] };
}

export function nextWeekPantry(plan: Plan, daysElapsed = 7): PantryItem[] {
  return plan.pantryAfter.map(p => ({ ...p, daysLeft: p.daysLeft === null ? null : p.daysLeft - daysElapsed }))
    .filter(p => p.grams > 0 && (p.daysLeft === null || p.daysLeft > 0));
}
