import type { Catalog, Inputs, Product, Recipe } from './types';

const product = (id: string, name: string, category: Product['category'], packageGrams: number, packageLabel: string, price: number, perishableDays: number | null, kcal: number, protein: number, carbs: number, fat: number): Product => ({ id, name, category, packageGrams, packageLabel, price, perishableDays, per100g: { kcal, protein, carbs, fat } });
export const fixtureCatalog: Catalog = {
  store: { name: 'Demo neighborhood grocery' }, priceSource: 'demo', pricedAt: '2026-11-14',
  products: [
    product('chicken-breast', 'Chicken breast, boneless', 'protein', 454, '1 lb tray', 4.99, 3, 120, 22.5, 0, 2.6),
    product('eggs', 'Large eggs', 'protein', 600, 'dozen', 3.29, 28, 143, 12.6, .7, 9.5),
    product('rice', 'Long grain rice, dry', 'grain', 907, '2 lb bag', 2.49, null, 365, 7.1, 80, .7),
    product('oats', 'Rolled oats', 'grain', 1190, '42 oz canister', 3.99, null, 379, 13.2, 67.7, 6.5),
    product('milk', 'Skim milk', 'dairy', 3785, '1 gallon', 3.49, 10, 34, 3.4, 5, .1),
    product('greek-yogurt', 'Plain nonfat Greek yogurt', 'dairy', 907, '32 oz tub', 4.49, 14, 59, 10.3, 3.6, .4),
    product('black-beans', 'Black beans, drained', 'pantry', 255, '15 oz can, drained', .89, null, 132, 8.9, 23.7, .5),
    product('pasta', 'Whole wheat pasta, dry', 'grain', 454, '16 oz box', 1.49, null, 348, 14.6, 70, 2.5),
    product('bananas', 'Bananas', 'produce', 680, '1.5 lb bunch', 1.29, 6, 89, 1.1, 22.8, .3),
    product('spinach', 'Baby spinach', 'produce', 142, '5 oz bag', 2.29, 5, 23, 2.9, 3.6, .4),
    product('broccoli', 'Frozen broccoli', 'frozen', 340, '12 oz bag', 1.19, 180, 34, 2.8, 6.6, .4),
    product('peanut-butter', 'Peanut butter', 'pantry', 454, '16 oz jar', 1.99, null, 588, 25, 20, 50),
    product('bread', 'Whole wheat bread', 'grain', 567, '20 oz loaf', 1.99, 10, 247, 13, 41, 4.2),
    product('tuna', 'Tuna in water, drained', 'protein', 113, '5 oz can, drained', .99, null, 116, 25.5, 0, .8),
  ],
};
function recipe(id: string, name: string, mealTypes: Recipe['mealTypes'], cookMinutes: number, ingredients: [string, number][], contains: string[]): Recipe {
  const perServing = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  for (const [id, grams] of ingredients) { const p = fixtureCatalog.products.find(p => p.id === id)!; for (const key of ['kcal', 'protein', 'carbs', 'fat'] as const) perServing[key] += p.per100g[key] * grams / 100; }
  return { id, name, description: `${name} with simple grocery staples.`, mealTypes, servings: 1, cookMinutes, ingredients: ingredients.map(([productId, grams]) => ({ productId, grams })), perServing, contains, steps: ['Weigh the ingredients.', 'Cook grains and proteins fully, then combine and serve.'], photo: `/recipes/${id}.jpg`, source: { name: 'Affordly test kitchen', url: 'https://example.com/recipes', license: 'CC0' } };
}
export const fixtureRecipes: Recipe[] = [
  recipe('yogurt-oats', 'Yogurt oat breakfast bowl', ['breakfast'], 5, [['oats', 110], ['greek-yogurt', 300], ['milk', 200], ['bananas', 100]], ['dairy']),
  recipe('peanut-oats', 'Peanut butter overnight oats', ['breakfast'], 5, [['oats', 100], ['milk', 400], ['peanut-butter', 25], ['greek-yogurt', 200]], ['dairy', 'nuts']),
  recipe('egg-toast', 'Eggs and yogurt with toast', ['breakfast'], 12, [['eggs', 150], ['bread', 150], ['greek-yogurt', 250]], ['egg', 'gluten', 'dairy']),
  recipe('tuna-rice', 'Tuna rice bowl', ['lunch', 'dinner'], 25, [['tuna', 226], ['rice', 125], ['broccoli', 100]], ['fish']),
  recipe('chicken-rice', 'Chicken and broccoli rice', ['lunch', 'dinner'], 30, [['chicken-breast', 230], ['rice', 125], ['broccoli', 100]], ['poultry', 'meat']),
  recipe('chicken-pasta', 'Chicken spinach pasta', ['lunch', 'dinner'], 25, [['chicken-breast', 210], ['pasta', 130], ['spinach', 50]], ['poultry', 'meat', 'gluten']),
  recipe('tuna-pasta', 'Tuna pasta', ['lunch', 'dinner'], 20, [['tuna', 200], ['pasta', 140], ['spinach', 50]], ['fish', 'gluten']),
  recipe('beans-rice', 'Bean rice and yogurt bowl', ['lunch', 'dinner'], 25, [['black-beans', 255], ['rice', 90], ['greek-yogurt', 250]], ['dairy']),
  recipe('egg-rice', 'Egg fried rice with yogurt', ['lunch', 'dinner'], 20, [['eggs', 180], ['rice', 110], ['broccoli', 100], ['greek-yogurt', 200]], ['egg', 'dairy']),
  recipe('tuna-sandwich', 'Tuna sandwich and banana', ['lunch', 'dinner'], 10, [['tuna', 226], ['bread', 180], ['bananas', 120]], ['fish', 'gluten']),
];
export const fixtureInputs: Inputs = { budget: 80, kcalPerDay: 2200, proteinPerDay: 150, maxCookMinutes: 30, avoid: [], workouts: [], excludedProductIds: [], excludedRecipeIds: [] };
