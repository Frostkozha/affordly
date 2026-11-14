import { readFile } from 'node:fs/promises';

const problems = [];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const number = value => typeof value === 'number' && Number.isFinite(value);
const string = value => typeof value === 'string';
const positive = value => number(value) && value > 0;
const nonnegative = value => number(value) && value >= 0;
const date = value => string(value) && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) && Number.isFinite(Date.parse(value));
const macros = { kcal: nonnegative, protein: nonnegative, carbs: nonnegative, fat: nonnegative };
function check(value, shape, path) {
  if (typeof shape === 'function') {
    if (!shape(value)) problems.push(`${path}: missing or invalid value`);
  } else if (Array.isArray(shape)) {
    if (!Array.isArray(value)) problems.push(`${path}: expected array`);
    else value.forEach((item, i) => check(item, shape[0], `${path}[${i}]`));
  } else {
    if (!object(value)) { problems.push(`${path}: expected object`); return; }
    for (const [key, type] of Object.entries(shape)) check(value[key], type, `${path}.${key}`);
  }
}
async function load(name) {
  try { return JSON.parse(await readFile(new URL(`../data/${name}.json`, import.meta.url), 'utf8')); }
  catch { problems.push(`data/${name}.json: cannot read file or invalid JSON`); return null; }
}
const catalog = await load('catalog');
const recipes = await load('recipes');
const id = value => string(value) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
if (catalog !== null) {
  check(catalog, {
    store: { name: string }, priceSource: value => ['kroger', 'demo'].includes(value), pricedAt: date,
    products: [{ id, name: string, category: value => ['protein', 'dairy', 'produce', 'grain', 'pantry', 'frozen'].includes(value), packageGrams: positive, packageLabel: string, price: nonnegative, perishableDays: value => value === null || nonnegative(value), per100g: macros }],
  }, 'catalog');
  if (object(catalog.store)) {
    for (const key of ['locationId', 'zip']) if (key in catalog.store) check(catalog.store[key], string, `catalog.store.${key}`);
  }
  if (Array.isArray(catalog.products)) catalog.products.forEach((product, i) => {
    if (object(product) && 'kroger' in product) check(product.kroger, { productId: string, description: string, size: string }, `catalog.products[${i}].kroger`);
  });
}
if (recipes !== null) check(recipes, [{
  id, name: string, description: string,
  mealTypes: [value => ['breakfast', 'lunch', 'dinner', 'snack'].includes(value)],
  servings: positive, cookMinutes: nonnegative,
  ingredients: [{ productId: string, grams: positive }], perServing: macros,
  contains: [value => string(value) && value === value.toLowerCase()], steps: [string],
  photo: value => string(value) && value.startsWith('/recipes/'),
  source: { name: string, url: string, license: string },
}], 'recipes');

function unique(items, label) {
  const seen = new Set();
  for (const item of items) {
    if (!object(item) || !string(item.id)) continue;
    if (seen.has(item.id)) problems.push(`${label}: duplicate id "${item.id}"`);
    seen.add(item.id);
  }
}
const products = Array.isArray(catalog?.products) ? catalog.products : [];
const recipeList = Array.isArray(recipes) ? recipes : [];
unique(products, 'catalog.products'); unique(recipeList, 'recipes');
const byId = new Map(products.filter(object).map(product => [product.id, product]));
for (const recipe of recipeList) {
  if (!object(recipe) || !Array.isArray(recipe.ingredients)) continue;
  const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  let computable = positive(recipe.servings);
  for (const ingredient of recipe.ingredients) {
    if (!object(ingredient)) { computable = false; continue; }
    const product = byId.get(ingredient.productId);
    if (!product) { problems.push(`recipe ${recipe.id}: unknown productId "${ingredient.productId}"`); computable = false; continue; }
    for (const key of Object.keys(totals)) {
      if (!positive(ingredient.grams) || !nonnegative(product.per100g?.[key])) { computable = false; continue; }
      totals[key] += product.per100g[key] * ingredient.grams / 100;
    }
  }
  if (computable) for (const [key, total] of Object.entries(totals)) {
    const expected = total / recipe.servings;
    const actual = recipe.perServing?.[key];
    if (number(actual) && Math.abs(actual - expected) > Math.abs(expected) * 0.05 + 1e-9) problems.push(`recipe ${recipe.id}: perServing.${key} is ${actual}, ingredient sum is ${expected.toFixed(3)} (over 5% difference)`);
  }
}
if (problems.length) {
  console.error(`Data validation failed (${problems.length} problems):\n${problems.map(problem => `- ${problem}`).join('\n')}`);
  process.exitCode = 1;
} else console.log(`Data valid: ${products.length} products, ${recipeList.length} recipes.`);
