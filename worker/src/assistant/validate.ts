import type { Plan } from '../../../packages/engine/src/types';
import type { AssistantRequest } from '../../../packages/engine/src/api';
import { HttpError } from '../http';
import { avoidTags } from './parse';
import { validRoute } from './route';

type Shape = string | { [key: string]: Shape } | [Shape];
const macros = { kcal: 'number', protein: 'number', carbs: 'number', fat: 'number' };
const pantry: Shape = [{ productId: 'string', grams: 'number', daysLeft: 'nullable-number' }];
const inputs: Shape = {
  budget: 'number', kcalPerDay: 'number', proteinPerDay: 'number', maxCookMinutes: 'number',
  avoid: ['string'], excludedProductIds: ['string'], excludedRecipeIds: ['string'],
  workouts: [{ day: 'number', start: 'string', kind: 'string', minutes: 'number' }],
};
const plan: Shape = {
  meals: [{ day: 'number', slot: 'string', time: 'string', recipeId: 'string', servings: 'number' }],
  basket: [{
    productId: 'string', gramsNeeded: 'number', gramsFromPantry: 'number', packages: 'number',
    cost: 'number', gramCost: 'number', gramsLeft: 'number',
  }],
  basketCost: 'number', gramCost: 'number', checkoutGap: 'number', days: [macros], average: macros,
  pantryAfter: pantry, perishableLeftValue: 'number', pantryUsedValue: 'number',
};

function matches(value: unknown, shape: Shape): boolean {
  if (shape === 'nullable-number') return value === null || matches(value, 'number');
  if (shape === 'number') return typeof value === 'number' && Number.isFinite(value) && value >= 0;
  if (shape === 'string') return typeof value === 'string' && value.length <= 1000;
  if (Array.isArray(shape)) {
    return Array.isArray(value) && value.length <= 200 && value.every(v => matches(v, shape[0]));
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.entries(shape).every(([key, spec]) => matches((value as Record<string, unknown>)[key], spec));
}

function validInputs(value: unknown): boolean {
  if (!matches(value, inputs)) return false;
  const i = value as AssistantRequest['inputs'];
  const likes = i.likedRecipeIds === undefined ? [] : i.likedRecipeIds;
  const arrays = [i.avoid, i.excludedProductIds, i.excludedRecipeIds, likes];
  if (!arrays.every(a => Array.isArray(a) && a.length <= 60)) return false;
  if (!likes.every(s => typeof s === 'string' && s.length <= 80)) return false;
  return i.budget >= 20 && i.budget <= 400
    && i.kcalPerDay >= 1200 && i.kcalPerDay <= 4500
    && i.proteinPerDay >= 40 && i.proteinPerDay <= 300
    && i.maxCookMinutes >= 10 && i.maxCookMinutes <= 120
    && (i.maxRepeats === undefined || [2, 3, 4].includes(i.maxRepeats))
    && i.avoid.every(t => avoidTags.includes(t)) && i.workouts.length <= 7
    && i.workouts.every(w => Number.isInteger(w.day) && w.day >= 0 && w.day <= 6
      && w.minutes >= 1 && w.minutes <= 240
      && /^([01]\d|2[0-3]):[0-5]\d$/.test(w.start)
      && ['strength', 'cardio', 'mixed'].includes(w.kind));
}

export function validate(value: unknown): AssistantRequest {
  const b = value as AssistantRequest | null;
  if (!b || typeof b.message !== 'string' || !b.message.trim() || b.message.length > 500
    || !validInputs(b.inputs) || !matches(b.pantry, pantry)) {
    throw new HttpError(400, 'Invalid assistant request');
  }
  if (b.history !== undefined && (!Array.isArray(b.history) || b.history.length > 6
    || b.history.some(t => !t || !['user', 'assistant'].includes(t.role)
      || typeof t.text !== 'string' || t.text.length > 500))) {
    throw new HttpError(400, 'Invalid history');
  }
  if (b.plus !== undefined && typeof b.plus !== 'boolean') throw new HttpError(400, 'Invalid Plus');
  if (b.plan != null && !matches(b.plan, plan)) throw new HttpError(400, 'Invalid current plan');
  if (b.route !== undefined && !validRoute(b.route)) throw new HttpError(400, 'Invalid action');
  if (b.asked && !Array.isArray(b.asked)) b.asked = [b.asked];
  if (b.result && !b.results) b.results = [b.result];
  if (b.asked && (!Array.isArray(b.asked) || !b.asked.length || b.asked.length > 3
    || !b.asked.every(validInputs))) throw new HttpError(400, 'Invalid asked inputs');
  if (b.results !== undefined) {
    if (!Array.isArray(b.results) || b.results.length !== b.asked?.length) {
      throw new HttpError(400, 'Invalid solver result');
    }
    for (const [index, r] of b.results.entries()) {
      const valid = r?.ok === true
        ? matches(r.plan, plan) && validReceipt(r.plan, b.asked![index].budget)
        : r?.ok === false && typeof r.reason === 'string' && r.reason.length <= 1000
          && Array.isArray(r.alternatives) && r.alternatives.length <= 3
          && r.alternatives.every(a => a && ['min-budget', 'max-protein', 'more-cook-time'].includes(a.kind)
            && typeof a.headline === 'string' && a.headline.length <= 500
            && validInputs(a.inputs) && matches(a.plan, plan) && validReceipt(a.plan, a.inputs.budget));
      if (!valid) throw new HttpError(400, 'Invalid solver result');
    }
  }
  return b;
}

function validReceipt(p: Plan, budget: number): boolean {
  const cost = p.basket.reduce((sum, line) => sum + line.cost, 0);
  const gramCost = p.basket.reduce((sum, line) => sum + line.gramCost, 0);
  const near = (a: number, b: number) => Math.abs(a - b) <= .01 + 1e-7;
  return near(p.basketCost, cost) && near(p.gramCost, gramCost)
    && near(p.checkoutGap, p.basketCost - p.gramCost)
    && p.basketCost <= budget && p.meals.length === 21;
}

