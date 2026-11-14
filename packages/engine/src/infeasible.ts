import type { Alternative, Catalog, Inputs, PantryItem, Recipe, SolveResult } from './types';
import { findPlan } from './optimize';

export function infeasible(inputs: Inputs, catalog: Catalog, recipes: Recipe[], pantry: PantryItem[]): SolveResult {
  const alternatives: Alternative[] = [];
  const cheapest = findPlan(inputs, catalog, recipes, pantry, true);
  if (cheapest && cheapest.basketCost > inputs.budget) alternatives.push({ kind: 'min-budget', headline: `Raise the budget to $${cheapest.basketCost.toFixed(2)}`, inputs: { ...inputs, budget: cheapest.basketCost }, plan: cheapest });
  let low = 0, high = Math.ceil(inputs.proteinPerDay / 5) - 1;
  let proteinAlternative: Alternative | undefined;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2), changed = { ...inputs, proteinPerDay: mid * 5 };
    const plan = findPlan(changed, catalog, recipes, pantry);
    if (plan) { proteinAlternative = { kind: 'max-protein', headline: `Keep $${inputs.budget.toFixed(2)} and get ${mid * 5} g of protein a day`, inputs: changed, plan }; low = mid + 1; }
    else high = mid - 1;
  }
  if (proteinAlternative) alternatives.push(proteinAlternative);
  for (let cook = Math.floor(inputs.maxCookMinutes / 5) * 5 + 5; cook <= 90; cook += 5) {
    if (!recipes.some(r => r.cookMinutes > cook - 5 && r.cookMinutes <= cook)) continue;
    const changed = { ...inputs, maxCookMinutes: cook }, plan = findPlan(changed, catalog, recipes, pantry);
    if (plan) { alternatives.push({ kind: 'more-cook-time', headline: `Allow ${cook} minutes of cooking`, inputs: changed, plan }); break; }
  }
  const reason = cheapest && cheapest.basketCost > inputs.budget
    ? `$${inputs.budget.toFixed(2)} a week cannot cover ${inputs.proteinPerDay} g of protein a day with these foods; the cheapest plan that does costs $${cheapest.basketCost.toFixed(2)}.`
    : alternatives.some(a => a.kind === 'more-cook-time') ? `The ${inputs.maxCookMinutes} minute cooking limit prevents a feasible plan with these foods.` : 'The available foods cannot meet the meal, nutrition, and scheduling limits together.';
  return { ok: false, reason, alternatives };
}
