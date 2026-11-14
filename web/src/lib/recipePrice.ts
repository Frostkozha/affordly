import type { Recipe } from '@affordly/engine';
import { getCatalog } from './engine';
export function recipePrice(recipe: Recipe) {
  const products = getCatalog().products;
  return recipe.ingredients.reduce((sum, ingredient) => {
    const product = products.find(p => p.id === ingredient.productId);
    return sum + (product ? ingredient.grams * product.price / product.packageGrams : 0);
  }, 0) / recipe.servings;
}
