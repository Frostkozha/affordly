import type { Catalog, Inputs, Macros, PantryItem, Plan, Recipe, VerifyReport } from './types';

export function verify(plan: Plan, inputs: Inputs, catalog: Catalog, recipes: Recipe[], pantry: PantryItem[]): VerifyReport {
  const errors: string[] = [];
  const fail = (s: string) => { errors.push(s); };
  const near = (a: number, b: number, tolerance: number, label: string) => { if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a - b) > tolerance + 1e-7) fail(label); };
  const keys = ['kcal', 'protein', 'carbs', 'fat'] as const;
  const days: Macros[] = Array.from({ length: 7 }, () => ({ kcal: 0, protein: 0, carbs: 0, fat: 0 }));
  const used = new Map<string, number>(), counts = new Map<string, number>();
  const nutrition = new Map<string, Macros>();
  const time = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s) ? +s.slice(0, 2) * 60 + +s.slice(3) : NaN;
  for (const m of plan.meals) {
    const r = recipes.find(r => r.id === m.recipeId);
    if (!r || !Number.isInteger(m.day) || !days[m.day] || !(m.servings >= 1 && m.servings <= 3 && Number.isInteger(m.servings * 2)) || !Number.isFinite(time(m.time))) { fail('Invalid meal'); continue; }
    counts.set(r.id, (counts.get(r.id) ?? 0) + 1);
    if (r.cookMinutes > inputs.maxCookMinutes || r.contains.some(t => inputs.avoid.includes(t)) || inputs.excludedRecipeIds.includes(r.id)) fail('Recipe excluded');
    const calculated: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    for (const ing of r.ingredients) {
      const p = catalog.products.find(p => p.id === ing.productId);
      if (!p || inputs.excludedProductIds.includes(ing.productId) || !(r.servings > 0) || ing.grams < 0) { fail('Invalid ingredient'); continue; }
      const grams = ing.grams / r.servings * m.servings;
      used.set(p.id, (used.get(p.id) ?? 0) + grams);
      for (const k of keys) calculated[k] += grams * p.per100g[k] / 100;
    }
    for (const k of keys) {
      near(r.perServing[k] * m.servings, calculated[k], Math.max(.001, calculated[k] * .05), 'Recipe macros inconsistent');
      days[m.day][k] += calculated[k];
    }
    nutrition.set(r.id, calculated);
    if (['breakfast', 'lunch', 'dinner'].includes(m.slot) && !r.mealTypes.includes(m.slot as 'breakfast')) fail('Meal type mismatch');
  }
  if (plan.meals.length !== 21 || [...counts.values()].some(n => n > 4)) fail('Weekly meal count');
  for (let d = 0; d < 7; d++) {
    const meals = plan.meals.filter(m => m.day === d).sort((a, b) => time(a.time) - time(b.time));
    if (meals.length !== 3 || new Set(meals.map(m => m.slot)).size !== 3) fail('Daily slots');
    const special = meals.filter(m => m.slot === 'pre-workout' || m.slot === 'post-workout');
    const workouts = inputs.workouts.filter(w => w.day === d);
    if (!workouts.length && special.length) fail('Unexpected workout slots');
    const regular = [ { type: 'breakfast' as const, minute: 480 }, { type: 'lunch' as const, minute: 780 }, { type: 'dinner' as const, minute: 1140 } ];
    const replaced = new Set<string>();
    for (const w of workouts) {
      const start = time(w.start), end = start + w.minutes;
      const pre = meals.find(m => m.slot === 'pre-workout' && start - time(m.time) >= 120 && start - time(m.time) <= 180);
      const post = meals.find(m => time(m.time) >= end);
      const macros = nutrition.get(pre?.recipeId ?? '');
      if (!macros || macros.carbs * 4 < .45 * macros.kcal || macros.fat * 9 > .3 * macros.kcal) fail('Pre-workout rule');
      if (!post || post.slot !== 'post-workout' || (nutrition.get(post.recipeId)?.protein ?? 0) < 30) fail('Post-workout rule');
      for (const meal of [pre, post]) {
        if (!meal) continue;
        const closest = regular.filter(s => !replaced.has(s.type)).sort((a,b) => Math.abs(a.minute - time(meal.time)) - Math.abs(b.minute - time(meal.time)))[0];
        if (!closest || !recipes.find(r => r.id === meal.recipeId)?.mealTypes.includes(closest.type)) fail('Replacement meal type');
        if (closest) replaced.add(closest.type);
      }
    }
    if (regular.some(s => replaced.has(s.type) === meals.some(m => m.slot === s.type))) fail('Replacement slots');
    if (days[d].kcal < inputs.kcalPerDay * .8 - .5 || days[d].kcal > inputs.kcalPerDay * 1.2 + .5 || days[d].protein < inputs.proteinPerDay * .85 - .5) fail('Daily nutrition');
    for (const k of keys) near(plan.days[d]?.[k], days[d][k], .5, 'Reported daily macros');
  }
  if (plan.days.length !== 7) fail('Days length');
  for (const k of keys) near(plan.average[k], days.reduce((s, d) => s + d[k], 0) / 7, .5, 'Average macros');
  const kcal = days.reduce((s, d) => s + d.kcal, 0), protein = days.reduce((s, d) => s + d.protein, 0);
  if (kcal < inputs.kcalPerDay * 7 * .9 - .5 || kcal > inputs.kcalPerDay * 7 * 1.1 + .5 || protein < inputs.proteinPerDay * 7 - .5) fail('Weekly nutrition');
  let cost = 0, gramCost = 0, leftValue = 0, pantryValue = 0;
  const ids = new Set<string>(), expected: PantryItem[] = [];
  for (const line of plan.basket) {
    const p = catalog.products.find(p => p.id === line.productId);
    if (!p || ids.has(line.productId)) { fail('Invalid basket line'); continue; }
    ids.add(p.id);
    if (!Number.isInteger(line.packages) || line.packages < 0 || (inputs.excludedProductIds.includes(p.id) && (line.packages > 0 || line.gramsNeeded > 0))) fail('Invalid purchase');
    const stock = pantry.filter(x => x.productId === p.id && (x.daysLeft === null || x.daysLeft > 0));
    const available = stock.reduce((s, x) => s + x.grams, 0), need = used.get(p.id) ?? 0, from = Math.min(need, available), left = available + line.packages * p.packageGrams - need;
    if (left < -.5) fail('Insufficient product');
    near(line.gramsNeeded, need, .5, 'Grams needed'); near(line.gramsFromPantry, from, .5, 'Pantry coverage'); near(line.gramsLeft, left, .5, 'Leftovers');
    const c = line.packages * p.price, g = (need - from) * p.price / p.packageGrams;
    near(line.cost, c, .01, 'Line cost'); near(line.gramCost, g, .01, 'Line gram cost');
    cost += c; gramCost += g; pantryValue += from * p.price / p.packageGrams;
    if (p.perishableDays !== null) leftValue += left * p.price / p.packageGrams;
  }
  for (const id of used.keys()) if (!ids.has(id)) fail('Missing basket product');
  for (const p of catalog.products) {
    let consumption = used.get(p.id) ?? 0;
    const stock = pantry.filter(x => x.productId === p.id && (x.daysLeft === null || x.daysLeft > 0)).slice().sort((a,b) => (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity));
    for (const x of stock) { const take = Math.min(consumption, x.grams); consumption -= take; if (x.grams - take > 1e-7) expected.push({ ...x, grams: x.grams - take }); }
    const bought = (plan.basket.find(l => l.productId === p.id)?.packages ?? 0) * p.packageGrams;
    if (bought - consumption > 1e-7) expected.push({ productId: p.id, grams: bought - consumption, daysLeft: p.perishableDays });
  }
  const aggregate = (items: PantryItem[]) => { const m = new Map<string, number>(); for (const x of items) { const key = `${x.productId}:${x.daysLeft}`; m.set(key, (m.get(key) ?? 0) + x.grams); } return m; };
  if (plan.pantryAfter.some(x => !catalog.products.some(p => p.id === x.productId) || !Number.isFinite(x.grams) || x.grams < 0 || (x.daysLeft !== null && (!Number.isFinite(x.daysLeft) || x.daysLeft <= 0)))) fail('Invalid pantry after');
  const actual = aggregate(plan.pantryAfter), wanted = aggregate(expected);
  for (const key of new Set([...actual.keys(), ...wanted.keys()])) near(actual.get(key) ?? 0, wanted.get(key) ?? 0, .5, 'Pantry after');
  near(plan.basketCost, cost, .01, 'Basket cost'); near(plan.gramCost, gramCost, .01, 'Gram cost'); near(plan.checkoutGap, cost - gramCost, .01, 'Checkout gap');
  near(plan.perishableLeftValue, leftValue, .01, 'Perishable value'); near(plan.pantryUsedValue, pantryValue, .01, 'Pantry used value');
  if (cost > inputs.budget + 1e-7 || cost < gramCost - .01) fail('Budget or checkout gap');
  return { ok: errors.length === 0, errors };
}
