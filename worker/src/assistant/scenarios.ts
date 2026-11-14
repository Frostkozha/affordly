import type { AssistantRequest } from '../../../packages/engine/src/api';
import type { Inputs, Workout } from '../../../packages/engine/src/types';
import type { Route } from './route';

export function change(inputs: Inputs, args: Record<string, unknown>): Inputs {
  const { avoidAdd, avoidRemove, ...fields } = args;
  return { ...inputs, ...fields,
    avoid: [...new Set([...inputs.avoid, ...(avoidAdd as string[] ?? [])])]
      .filter(t => !(avoidRemove as string[] ?? []).includes(t)),
  };
}

export function scenarios(body: AssistantRequest, route: Route): Inputs[] {
  const a = route.args;
  const i = structuredClone(body.inputs);
  switch (route.action) {
    case 'compare': return (a.scenarios as Record<string, unknown>[]).map(s => change(i, s));
    case 'change-inputs': return [change(i, a)];
    case 'swap-product':
      i.excludedProductIds = [...new Set([...i.excludedProductIds, a.productId as string])];
      return [i];
    case 'like-recipe':
      i.likedRecipeIds = [...new Set([...(i.likedRecipeIds ?? []), a.recipeId as string])];
      i.excludedRecipeIds = i.excludedRecipeIds.filter(id => id !== a.recipeId);
      return [i];
    case 'dislike-recipe':
      i.excludedRecipeIds = [...new Set([...i.excludedRecipeIds, a.recipeId as string])];
      i.likedRecipeIds = i.likedRecipeIds?.filter(id => id !== a.recipeId);
      return [i];
    case 'add-workout':
      if (!body.plus) return [];
      i.workouts = [...i.workouts.filter(w => w.day !== a.day), a as unknown as Workout];
      return [i];
    default: return [];
  }
}

