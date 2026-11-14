import type { Plan, Recipe } from '@affordly/engine';
import { getRecipes } from './engine';
export type ReelKind = 'receipt' | 'basket' | 'gap' | 'leftovers' | 'cook' | 'creators';
export interface ReelData {
  id: string;
  kind: ReelKind;
  title: string;
  duration: number;
  recipe?: Recipe
}
export function reelData(plan: Plan, sample: boolean, week: number): ReelData[] {
  const items: ReelData[] = [
    { id: 'receipt', kind: 'receipt', title: "This week's receipt", duration: 7000 },
    { id: 'basket', kind: 'basket', title: 'All of this', duration: 9000 },
    { id: 'gap', kind: 'gap', title: 'The Checkout Gap', duration: 8000 },
  ];
  if (!sample && week >= 2 && plan.pantryUsedValue > 0)
    items.push({
      id: 'leftovers', kind: 'leftovers', title: 'Leftovers saved', duration: 7000,
    });
  const ids = [...new Set(plan.meals.map(meal => meal.recipeId))].slice(0, 3);
  for (const id of ids) {
    const recipe = getRecipes().find(r => r.id === id);
    if (recipe)
      items.push({ id, kind: 'cook', title: recipe.name, duration: 10000, recipe });
  }
  items.push({ id: 'creators', kind: 'creators', title: 'Make reels like this', duration: 8000 });
  return items;
}
