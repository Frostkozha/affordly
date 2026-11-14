// MOCK: replaced by the real engine in integration
import type { Catalog, Inputs, Recipe, Plan, PantryItem, SolveResult } from '@affordly/engine';
import { fmtMoney } from './fmtMoney';

export const defaultInputs: Inputs = { budget: 80, kcalPerDay: 2200, proteinPerDay: 150, maxCookMinutes: 30, avoid: [], workouts: [], excludedProductIds: [], excludedRecipeIds: [] };
export const demoTerms = { minimumBudget: 65, freeSwaps: 3, monthly: 7.99, yearly: 59.99 };
export const catalog: Catalog = {
  store: { name: 'Sample neighborhood store' }, priceSource: 'demo', pricedAt: '2026-11-14T12:00:00Z',
  products: [
    { id: 'oats', name: 'Rolled oats', category: 'grain', packageGrams: 1000, packageLabel: '1 kg bag', price: 4.49, perishableDays: null, per100g: { kcal: 380, protein: 13, carbs: 67, fat: 7 } },
    { id: 'yogurt', name: 'Greek yogurt', category: 'dairy', packageGrams: 1000, packageLabel: '1 kg tub', price: 5.49, perishableDays: 14, per100g: { kcal: 90, protein: 10, carbs: 4, fat: 4 } },
    { id: 'chicken', name: 'Chicken breast', category: 'protein', packageGrams: 1000, packageLabel: '1 kg tray', price: 9.49, perishableDays: 10, per100g: { kcal: 165, protein: 31, carbs: 0, fat: 4 } },
    { id: 'rice', name: 'Brown rice', category: 'grain', packageGrams: 1000, packageLabel: '1 kg bag', price: 3.49, perishableDays: null, per100g: { kcal: 360, protein: 7, carbs: 77, fat: 3 } },
    { id: 'lentils', name: 'Red lentils', category: 'pantry', packageGrams: 1000, packageLabel: '1 kg bag', price: 3.99, perishableDays: null, per100g: { kcal: 350, protein: 25, carbs: 60, fat: 1 } },
    { id: 'vegetables', name: 'Mixed vegetables', category: 'frozen', packageGrams: 1000, packageLabel: '1 kg frozen bag', price: 3.99, perishableDays: null, per100g: { kcal: 60, protein: 3, carbs: 10, fat: 1 } },
    { id: 'eggs', name: 'Eggs', category: 'protein', packageGrams: 600, packageLabel: 'dozen', price: 4.29, perishableDays: 21, per100g: { kcal: 143, protein: 13, carbs: 1, fat: 10 } },
    { id: 'oil', name: 'Olive oil', category: 'pantry', packageGrams: 500, packageLabel: '500 ml bottle', price: 6.49, perishableDays: null, per100g: { kcal: 884, protein: 0, carbs: 0, fat: 100 } },
  ],
};
const definitions = [
  { name: 'Creamy overnight oats', ingredients: [{ productId: 'oats', grams: 100 }, { productId: 'yogurt', grams: 250 }], mealTypes: ['breakfast'] as Recipe['mealTypes'], contains: ['dairy'], cookMinutes: 10 },
  { name: 'Warm lentil breakfast bowl', ingredients: [{ productId: 'lentils', grams: 100 }, { productId: 'eggs', grams: 150 }, { productId: 'oil', grams: 10 }], mealTypes: ['breakfast'] as Recipe['mealTypes'], contains: ['egg'], cookMinutes: 15 },
  { name: 'Chicken and brown rice', ingredients: [{ productId: 'chicken', grams: 200 }, { productId: 'rice', grams: 90 }, { productId: 'vegetables', grams: 150 }, { productId: 'oil', grams: 10 }], mealTypes: ['lunch'] as Recipe['mealTypes'], contains: ['poultry'], cookMinutes: 30 },
  { name: 'Golden lentil rice bowl', ingredients: [{ productId: 'lentils', grams: 140 }, { productId: 'rice', grams: 70 }, { productId: 'vegetables', grams: 150 }, { productId: 'oil', grams: 10 }], mealTypes: ['lunch'] as Recipe['mealTypes'], contains: [], cookMinutes: 30 },
  { name: 'Chicken and lentil skillet', ingredients: [{ productId: 'chicken', grams: 180 }, { productId: 'lentils', grams: 100 }, { productId: 'vegetables', grams: 200 }, { productId: 'oil', grams: 10 }], mealTypes: ['dinner'] as Recipe['mealTypes'], contains: ['poultry'], cookMinutes: 30 },
  { name: 'Egg fried rice', ingredients: [{ productId: 'eggs', grams: 200 }, { productId: 'rice', grams: 110 }, { productId: 'vegetables', grams: 200 }, { productId: 'oil', grams: 15 }], mealTypes: ['dinner'] as Recipe['mealTypes'], contains: ['egg'], cookMinutes: 15 },
];
const photos = ['overnight-oatmeal-berries', 'breakfast-potato-egg-burritos', 'brown-rice-sizzling-chicken-and-vegetables', 'cuban-beans-and-rice', 'chicken-stir-fry', 'baked-eggs-cheese'];
export const recipes: Recipe[] = definitions.map((recipe, i) => ({
  ...recipe, id: `recipe-${i + 1}`, description: 'A simple, filling meal made with everyday groceries.', servings: 1,
  perServing: recipe.ingredients.reduce((total, ingredient) => {
    const macros = catalog.products.find(p => p.id === ingredient.productId)!.per100g;
    return { kcal: total.kcal + macros.kcal * ingredient.grams / 100, protein: total.protein + macros.protein * ingredient.grams / 100, carbs: total.carbs + macros.carbs * ingredient.grams / 100, fat: total.fat + macros.fat * ingredient.grams / 100 };
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 }),
  steps: ['Measure the ingredients for your serving.', 'Cook the grains or lentils in water until tender.', 'Cook remaining ingredients thoroughly, combine, and serve.'],
  photo: `/recipes/${photos[i]}.jpg`, source: { name: 'Affordly test kitchen', url: 'https://creativecommons.org/publicdomain/zero/1.0/', license: 'CC0 demo recipe' },
}));
export const originalPrices = Object.fromEntries(catalog.products.map(p => [p.id, p.price]));

export function makePlan(inputs: Inputs, pantry: PantryItem[] = []): Plan {
  const meals: Plan['meals'] = [];
  for (let day = 0; day < 7; day++) {
    (['breakfast', 'lunch', 'dinner'] as const).forEach((slot, index) => {
      const candidates = recipes.filter(r => r.mealTypes.includes(slot) && !inputs.excludedRecipeIds.includes(r.id) && !r.contains.some(t => inputs.avoid.includes(t)) && !r.ingredients.some(i => inputs.excludedProductIds.includes(i.productId)) && r.cookMinutes <= inputs.maxCookMinutes);
      const recipe = candidates[day % candidates.length] ?? recipes[index * 2];
      meals.push({ day, slot, time: ['08:00', '12:30', '18:30'][index], recipeId: recipe.id, servings: 1 });
    });
  }
  for (const workout of inputs.workouts) {
    const daily = meals.filter(m => m.day === workout.day);
    const start = Number(workout.start.slice(0, 2)) * 60 + Number(workout.start.slice(3));
    const time = (minutes: number) => `${String(Math.floor(Math.max(0, minutes) / 60) % 24).padStart(2, '0')}:${String(Math.max(0, minutes) % 60).padStart(2, '0')}`;
    daily[1].slot = 'pre-workout'; daily[1].time = time(start - 150); daily[1].recipeId = recipes[3].id;
    daily[2].slot = 'post-workout'; daily[2].time = time(start + workout.minutes); daily[2].recipeId = recipes[4].id;
  }
  const days = Array.from({ length: 7 }, (_, day) => meals.filter(m => m.day === day).reduce((sum, meal) => {
    const m = recipes.find(r => r.id === meal.recipeId)!.perServing;
    return { kcal: sum.kcal + m.kcal, protein: sum.protein + m.protein, carbs: sum.carbs + m.carbs, fat: sum.fat + m.fat };
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 }));
  const basket = catalog.products.map(product => {
    const gramsNeeded = meals.reduce((total, meal) => total + (recipes.find(r => r.id === meal.recipeId)!.ingredients.find(i => i.productId === product.id)?.grams ?? 0) * meal.servings, 0);
    const gramsFromPantry = Math.min(gramsNeeded, pantry.filter(p => p.productId === product.id).reduce((sum, p) => sum + p.grams, 0));
    const packages = Math.ceil((gramsNeeded - gramsFromPantry) / product.packageGrams);
    return { productId: product.id, gramsNeeded, gramsFromPantry, packages, cost: packages * product.price, gramCost: (gramsNeeded - gramsFromPantry) / product.packageGrams * product.price, gramsLeft: packages * product.packageGrams + gramsFromPantry - gramsNeeded };
  }).filter(line => line.gramsNeeded > 0);
  const basketCost = basket.reduce((sum, l) => sum + l.cost, 0), gramCost = basket.reduce((sum, l) => sum + l.gramCost, 0);
  return { meals, basket, basketCost, gramCost, checkoutGap: basketCost - gramCost, days,
    average: { kcal: days.reduce((s, d) => s + d.kcal, 0) / 7, protein: days.reduce((s, d) => s + d.protein, 0) / 7, carbs: days.reduce((s, d) => s + d.carbs, 0) / 7, fat: days.reduce((s, d) => s + d.fat, 0) / 7 },
    pantryAfter: basket.filter(l => l.gramsLeft > 0).map(l => ({ productId: l.productId, grams: l.gramsLeft, daysLeft: catalog.products.find(p => p.id === l.productId)!.perishableDays })),
    perishableLeftValue: basket.reduce((s, l) => s + (catalog.products.find(p => p.id === l.productId)!.perishableDays === null ? 0 : l.cost - l.gramCost), 0),
    pantryUsedValue: basket.reduce((s, l) => { const p = catalog.products.find(p => p.id === l.productId)!; return s + l.gramsFromPantry / p.packageGrams * p.price; }, 0),
  };
}
export function mockSolve(inputs: Inputs, pantry: PantryItem[]): SolveResult {
  const plan = makePlan(inputs, pantry);
  const matches = plan.meals.every(meal => {
    const recipe = recipes.find(r => r.id === meal.recipeId)!;
    return recipe.cookMinutes <= inputs.maxCookMinutes && !recipe.contains.some(tag => inputs.avoid.includes(tag)) && !inputs.excludedRecipeIds.includes(recipe.id) && !recipe.ingredients.some(i => inputs.excludedProductIds.includes(i.productId)) && plan.meals.filter(m => m.recipeId === recipe.id).length <= 4;
  }) && Math.abs(plan.average.kcal - inputs.kcalPerDay) <= inputs.kcalPerDay * .1 && plan.average.protein >= inputs.proteinPerDay && plan.days.every(d => Math.abs(d.kcal - inputs.kcalPerDay) <= inputs.kcalPerDay * .2 && d.protein >= inputs.proteinPerDay * .85);
  if (matches && inputs.budget >= demoTerms.minimumBudget && plan.basketCost <= inputs.budget) return { ok: true, plan };
  const base = matches ? inputs : { ...defaultInputs };
  const baseline = makePlan(base, pantry);
  const minimum = Math.max(demoTerms.minimumBudget, Math.ceil(baseline.basketCost * 100) / 100);
  const alternatives = [
    { kind: 'min-budget' as const, headline: matches ? `Raise the budget to ${fmtMoney(minimum)}` : `Use the sample week at ${fmtMoney(minimum)}`, inputs: { ...base, budget: minimum } },
    { kind: 'max-protein' as const, headline: 'Try the sample protein target', inputs: { ...base, budget: minimum, proteinPerDay: defaultInputs.proteinPerDay } },
    { kind: 'more-cook-time' as const, headline: 'Allow 45 minutes per recipe', inputs: { ...base, budget: minimum, maxCookMinutes: 45 } },
  ].map(alt => ({ ...alt, plan: makePlan(alt.inputs, pantry) }));
  return { ok: false, reason: matches ? `This demo requires a budget of at least ${fmtMoney(minimum)}. The whole-package basket costs ${fmtMoney(plan.basketCost)} against your ${fmtMoney(inputs.budget)} budget.` : `The six demo recipes cannot meet all your current rules. The sample week costs ${fmtMoney(baseline.basketCost)}; the options below show which inputs would change.`, alternatives };
}
