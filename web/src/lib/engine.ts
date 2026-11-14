// MOCK: replaced by the real engine in integration
import type { Inputs, PantryItem, Plan, SolveResult, Catalog, Recipe } from '@affordly/engine';
import { catalog, recipes, mockSolve } from './mock';
export async function solvePlan(inputs: Inputs, pantry: PantryItem[]): Promise<SolveResult> { return mockSolve(inputs, pantry); }
export function getCatalog(): Catalog { return catalog; }
export function getRecipes(): Recipe[] { return recipes; }
export function setPrice(productId: string, price: number): void {
  if (!Number.isFinite(price) || price < 0) throw new Error('Enter a valid price.');
  const product = catalog.products.find(p => p.id === productId);
  if (product) product.price = price;
}
export function swapProduct(inputs: Inputs, productId: string): Inputs { return { ...inputs, excludedProductIds: [...new Set([...inputs.excludedProductIds, productId])] }; }
export function nextWeekPantry(plan: Plan): PantryItem[] { return plan.pantryAfter.map(p => ({ ...p, daysLeft: p.daysLeft === null ? null : p.daysLeft - 7 })).filter(p => p.daysLeft === null || p.daysLeft > 0); }
