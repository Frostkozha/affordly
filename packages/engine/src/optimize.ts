import { solveModel } from './lp';
import type { Catalog, Inputs, Macros, PantryItem, Plan, Recipe, SolveResult } from './types';
import { fits, positions, schedule } from './schedule';
import { verify } from './verify';
import { infeasible } from './infeasible';

const cents = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export function findPlan(inputs: Inputs, catalog: Catalog, allRecipes: Recipe[], pantry: PantryItem[], minimumCost = false): Plan | null {
  const recipes = allRecipes.filter(r => r.cookMinutes <= inputs.maxCookMinutes && !inputs.excludedRecipeIds.includes(r.id) && !r.contains.some(t => inputs.avoid.includes(t)) && r.ingredients.every(i => !inputs.excludedProductIds.includes(i.productId) && catalog.products.some(p => p.id === i.productId))).map(r => {
    const perServing: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    for (const ing of r.ingredients) {
      const p = catalog.products.find(p => p.id === ing.productId)!;
      for (const k of ['kcal', 'protein', 'carbs', 'fat'] as const) perServing[k] += ing.grams / r.servings * p.per100g[k] / 100;
    }
    // One meal is a portion of 1 to 3 servings (half steps), sized to a third of the daily calories.
    const portion = Math.min(3, Math.max(1, Math.round(inputs.kcalPerDay / 3 / perServing.kcal * 2) / 2));
    for (const k of ['kcal', 'protein', 'carbs', 'fat'] as const) perServing[k] *= portion;
    return { ...r, servings: r.servings / portion, perServing, portion };
  });
  const ps = positions(inputs);
  if (!ps || recipes.length < 6) return null;
  const constraints: Record<string, { min?: number; max?: number; equal?: number }> = { meals: { equal: 21 }, kcal: { min: inputs.kcalPerDay * 7 * .9, max: inputs.kcalPerDay * 7 * 1.1 }, protein: { min: inputs.proteinPerDay * 7 }, cost: { max: minimumCost ? Infinity : inputs.budget } };
  if (minimumCost) delete constraints.cost;
  const variables: Record<string, Record<string, number>> = {}, ints: Record<string, number> = {};
  const stock = (id: string) => pantry.filter(p => p.productId === id && (p.daysLeft === null || p.daysLeft > 0)).reduce((s, p) => s + p.grams, 0);
  catalog.products.forEach((p, j) => {
    if (!recipes.some(r => r.ingredients.some(x => x.productId === p.id))) return;
    constraints[`g${j}`] = { max: stock(p.id) };
    variables[`p${j}`] = { objective: p.price * (minimumCost || p.perishableDays === null ? 1 : 2), cost: p.price, [`g${j}`]: -p.packageGrams };
    ints[`p${j}`] = 1;
  });
  // Hall's capacity inequalities ensure the counts can fill all slot categories.
  const categories = [...new Map(ps.map(p => [`${p.type}:${p.slot}`, p])).values()];
  for (let mask = 1; mask < 1 << categories.length; mask++) {
    const subset = categories.filter((_, i) => mask & (1 << i));
    constraints[`s${mask}`] = { min: ps.filter(p => subset.some(c => c.type === p.type && c.slot === p.slot)).length };
  }
  recipes.forEach((r, i) => {
    constraints[`r${i}`] = { max: 4 };
    const v: Record<string, number> = { objective: 0, meals: 1, kcal: r.perServing.kcal, protein: r.perServing.protein, [`r${i}`]: 1 };
    for (const ing of r.ingredients) {
      const j = catalog.products.findIndex(p => p.id === ing.productId), p = catalog.products[j], g = ing.grams / r.servings;
      v[`g${j}`] = (v[`g${j}`] ?? 0) + g;
      if (!minimumCost && p.perishableDays !== null) v.objective -= g * p.price / p.packageGrams;
    }
    for (let mask = 1; mask < 1 << categories.length; mask++) if (categories.some((p, j) => (mask & (1 << j)) && fits(r, p))) v[`s${mask}`] = 1;
    // Each serving beyond the first costs a small repeat penalty.
    if (!minimumCost) {
      constraints[`repeat${i}`] = { max: 1 };
      v[`repeat${i}`] = 1;
      variables[`repeat${i}`] = { objective: .01, [`repeat${i}`]: -1 };
    }
    variables[`r${i}`] = v; ints[`r${i}`] = 1;
  });
  // Equivalent recipes create symmetric branches; order their counts without
  // removing any possible menu or changing the four-serving limit per recipe.
  const previous = new Map<string, number>();
  recipes.forEach((r, i) => {
    const signature = JSON.stringify([r.ingredients, r.servings, r.perServing, [...r.mealTypes].sort()]);
    const prior = previous.get(signature);
    if (prior !== undefined) {
      constraints[`order${i}`] = { min: 0 };
      variables[`r${prior}`][`order${i}`] = 1;
      variables[`r${i}`][`order${i}`] = -1;
    }
    previous.set(signature, i);
  });
  for (let attempt = 0; attempt < 5; attempt++) {
    const result = solveModel({ constraints, variables, ints }, minimumCost ? 0.001 : 0.005);
    if (!result) break;
    const counts = recipes.map((_, i) => Math.round(result[`r${i}`] ?? 0));
    const meals = schedule(inputs, recipes, counts);
    if (meals) {
      for (const m of meals) m.servings = recipes.find(r => r.id === m.recipeId)!.portion;
      const used = new Map<string, number>();
      recipes.forEach((r, i) => r.ingredients.forEach(x => used.set(x.productId, (used.get(x.productId) ?? 0) + x.grams / r.servings * counts[i])));
      const pantryAfter: PantryItem[] = [];
      const basket = catalog.products.filter(p => (used.get(p.id) ?? 0) > 0 || stock(p.id) > 0).map(p => {
        const gramsNeeded = used.get(p.id) ?? 0, gramsFromPantry = Math.min(gramsNeeded, stock(p.id));
        const packages = Math.max(0, Math.ceil((gramsNeeded - gramsFromPantry - 1e-7) / p.packageGrams));
        let remaining = gramsNeeded;
        for (const x of pantry.filter(x => x.productId === p.id && (x.daysLeft === null || x.daysLeft > 0)).slice().sort((a,b) => (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity))) {
          const take = Math.min(remaining, x.grams); remaining -= take;
          if (x.grams > take) pantryAfter.push({ ...x, grams: x.grams - take });
        }
        const fresh = packages * p.packageGrams - remaining;
        if (fresh > 1e-7) pantryAfter.push({ productId: p.id, grams: fresh, daysLeft: p.perishableDays });
        return { productId: p.id, gramsNeeded, gramsFromPantry, packages, cost: cents(packages * p.price), gramCost: cents((gramsNeeded - gramsFromPantry) * p.price / p.packageGrams), gramsLeft: stock(p.id) + packages * p.packageGrams - gramsNeeded };
      });
      const keys = ['kcal', 'protein', 'carbs', 'fat'] as const;
      const days: Macros[] = Array.from({ length: 7 }, () => ({ kcal: 0, protein: 0, carbs: 0, fat: 0 }));
      for (const m of meals) { const r = recipes.find(r => r.id === m.recipeId)!; for (const k of keys) days[m.day][k] += r.perServing[k]; }
      const average = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
      for (const k of keys) average[k] = days.reduce((s,d) => s + d[k], 0) / 7;
      let rawCost = 0, rawGram = 0, perishable = 0, pantryValue = 0;
      for (const l of basket) { const p = catalog.products.find(p => p.id === l.productId)!; rawCost += l.packages * p.price; rawGram += (l.gramsNeeded - l.gramsFromPantry) * p.price / p.packageGrams; pantryValue += l.gramsFromPantry * p.price / p.packageGrams; if (p.perishableDays !== null) perishable += l.gramsLeft * p.price / p.packageGrams; }
      const plan: Plan = { meals, basket, basketCost: cents(rawCost), gramCost: cents(rawGram), checkoutGap: cents(cents(rawCost) - cents(rawGram)), days, average, pantryAfter, perishableLeftValue: cents(perishable), pantryUsedValue: cents(pantryValue) };
      const checkInputs = minimumCost ? { ...inputs, budget: plan.basketCost } : inputs;
      if (verify(plan, checkInputs, catalog, allRecipes, pantry).ok) return plan;
    }
    const worst = counts.map((n,i) => ({n,i})).filter(x => x.n > 0).sort((a,b) => b.n - a.n)[0];
    if (!worst) break;
    constraints[`r${worst.i}`].max = worst.n - 1;
  }
  return null;
}

export function solve(inputs: Inputs, catalog: Catalog, recipes: Recipe[], pantry: PantryItem[]): SolveResult {
  const plan = findPlan(inputs, catalog, recipes, pantry);
  return plan ? { ok: true, plan } : infeasible(inputs, catalog, recipes, pantry);
}
