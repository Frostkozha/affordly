// The only place the screens get plans from. The optimizer and verifier live in @affordly/engine
// and run in a Web Worker; the catalog and recipes are the JSON files in /data.
import { nextWeekPantry as agePantry, swapProduct as excludeProduct } from '@affordly/engine';
import type { Catalog, Inputs, PantryItem, Plan, Recipe, SolveResult } from '@affordly/engine';
import catalogJson from '../../../data/catalog.json';
import recipesJson from '../../../data/recipes.json';
import type { SolveReply, SolveRequest } from './solver.worker';

const catalog = structuredClone(catalogJson) as Catalog;
const recipes = recipesJson as Recipe[];

export const originalPrices: Record<string, number> = Object.fromEntries(
  (catalogJson as Catalog).products.map(p => [p.id, p.price]),
);

const worker = new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' });
const waiting = new Map<number, { resolve: (r: SolveResult) => void; reject: (e: Error) => void }>();
let nextId = 1;

worker.onmessage = (event: MessageEvent<SolveReply>) => {
  const { id, result, error } = event.data;
  const pending = waiting.get(id);
  if (!pending) return;
  waiting.delete(id);
  if (result) pending.resolve(result);
  else pending.reject(new Error(error ?? 'Solver failed'));
};

export function solvePlan(inputs: Inputs, pantry: PantryItem[]): Promise<SolveResult> {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    waiting.set(id, { resolve, reject });
    worker.postMessage({ id, inputs, catalog, recipes, pantry } satisfies SolveRequest);
  });
}

export function getCatalog(): Catalog { return catalog; }
export function getRecipes(): Recipe[] { return recipes; }

export function setPrice(productId: string, price: number): void {
  if (!Number.isFinite(price) || price < 0) throw new Error('Enter a valid price.');
  const product = catalog.products.find(p => p.id === productId);
  if (product) product.price = price;
}

export function swapProduct(inputs: Inputs, productId: string): Inputs { return excludeProduct(inputs, productId); }
export function nextWeekPantry(plan: Plan): PantryItem[] { return agePantry(plan); }
