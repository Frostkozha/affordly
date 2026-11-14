import type { Alternative, Catalog, Inputs, PantryItem, Recipe, SolveResult } from './types';
import { findPlan } from './optimize';

export function infeasible(
  inputs: Inputs, catalog: Catalog, recipes: Recipe[], pantry: PantryItem[],
): SolveResult {
  const alternatives: Alternative[] = [];
  // Carb and fat targets are the newest and softest limit: when dropping them is enough, offer the closest split.
  if (inputs.carbsPerDay || inputs.fatPerDay) {
    const open = findPlan({ ...inputs, carbsPerDay: undefined, fatPerDay: undefined }, catalog, recipes, pantry);
    if (open) {
      const round = (n: number) => Math.round(n / 5) * 5;
      // Try the point halfway between what was asked and what the foods give on their own; fall back to the latter.
      const half = { ...inputs, carbsPerDay: round(((inputs.carbsPerDay ?? open.average.carbs) + open.average.carbs) / 2), fatPerDay: round(((inputs.fatPerDay ?? open.average.fat) + open.average.fat) / 2) };
      const closer = findPlan(half, catalog, recipes, pantry);
      const plan = closer ?? open;
      const changed = closer ? half : { ...inputs, carbsPerDay: round(open.average.carbs), fatPerDay: round(open.average.fat) };
      return {
        ok: false,
        reason: 'These foods cannot reach ' + (inputs.carbsPerDay ?? 'any') + ' g of carbs and ' + (inputs.fatPerDay ?? 'any')
          + ' g of fat a day inside your other limits.',
        alternatives: [{
          kind: 'closest-macros',
          headline: 'Keep everything else and eat ' + changed.carbsPerDay + ' g carbs, ' + changed.fatPerDay + ' g fat a day',
          inputs: changed, plan,
        }],
      };
    }
  }
  const cheapest = findPlan(inputs, catalog, recipes, pantry, true);
  if (cheapest && cheapest.basketCost > inputs.budget) {
    alternatives.push({
      kind: 'min-budget',
      headline: 'Raise the budget to $' + cheapest.basketCost.toFixed(2),
      inputs: { ...inputs, budget: cheapest.basketCost },
      plan: cheapest,
    });
  }
  let low = 0;
  let high = Math.ceil(inputs.proteinPerDay / 5) - 1;
  let proteinAlternative: Alternative | undefined;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const changed = { ...inputs, proteinPerDay: mid * 5 };
    const plan = findPlan(changed, catalog, recipes, pantry);
    if (plan) {
      proteinAlternative = {
        kind: 'max-protein',
        headline: 'Keep $' + inputs.budget.toFixed(2) + ' and get ' + mid * 5 + ' g of protein a day',
        inputs: changed,
        plan,
      };
      low = mid + 1;
    } else {
      high = mid - 1;
    }
    if (proteinAlternative && (high - low) * 5 <= 10) break;
  }
  if (proteinAlternative) alternatives.push(proteinAlternative);
  const cookingExcludesRecipes = recipes.some(r => r.cookMinutes > inputs.maxCookMinutes);
  // Only offer cooking limits the form can show (15/30/45/60 minute chips).
  for (const cook of [15, 30, 45, 60]) {
    if (!cookingExcludesRecipes || cook <= inputs.maxCookMinutes) continue;
    if (!recipes.some(r => r.cookMinutes > inputs.maxCookMinutes && r.cookMinutes <= cook)) continue;
    const changed = { ...inputs, maxCookMinutes: cook };
    const plan = findPlan(changed, catalog, recipes, pantry);
    if (plan) {
      alternatives.push({
        kind: 'more-cook-time', headline: 'Allow ' + cook + ' minutes of cooking', inputs: changed, plan,
      });
      break;
    }
  }
  // Seven slots of a meal type need enough recipes for the repeat limit (3 recipes at the default of 3).
  const allowed = recipes.filter(r => r.cookMinutes <= inputs.maxCookMinutes
    && !inputs.excludedRecipeIds.includes(r.id)
    && !r.contains.some(t => inputs.avoid.includes(t))
    && !r.ingredients.some(i => inputs.excludedProductIds.includes(i.productId)));
  const short = (['breakfast', 'lunch', 'dinner'] as const)
    .find(type => allowed.filter(r => r.mealTypes.includes(type)).length < Math.ceil(7 / (inputs.maxRepeats ?? 3)));
  if (short && !alternatives.length) {
    const left = allowed.filter(r => r.mealTypes.includes(short)).length;
    const subject = left === 0 ? 'No ' + short + ' recipes are'
      : 'Only ' + left + ' ' + short + ' recipe' + (left === 1 ? ' is' : 's are');
    return {
      ok: false,
      reason: subject + ' left after your exclusions and cooking limit, and a week needs at least ' + Math.ceil(7 / (inputs.maxRepeats ?? 3)) + '. '
        + 'Remove an exclusion or allow more cooking time.',
      alternatives,
    };
  }
  let reason = 'The available foods cannot meet the meal, nutrition, and scheduling limits together.';
  if (cheapest && cheapest.basketCost > inputs.budget) {
    reason = '$' + inputs.budget.toFixed(2) + ' a week cannot cover ' + inputs.proteinPerDay
      + ' g of protein a day with these foods; the cheapest plan that does costs $'
      + cheapest.basketCost.toFixed(2) + '.';
  } else if (alternatives.some(a => a.kind === 'more-cook-time')) {
    reason = 'The ' + inputs.maxCookMinutes
      + ' minute cooking limit prevents a feasible plan with these foods.';
  }
  return { ok: false, reason, alternatives };
}
