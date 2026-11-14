import type { Plan, PlannedMeal } from '@affordly/engine';

export const eatenKey = (week: number, meal: PlannedMeal) => `${week}:${meal.day}:${meal.slot}`;

export const isEaten = (eaten: string[] | undefined, week: number, meal: PlannedMeal) =>
  Boolean(eaten?.includes(eatenKey(week, meal)));

function recipeAt(plan: Plan | null, week: number, key: string) {
  const [keyWeek, day, slot] = key.split(':');
  if (!plan || Number(keyWeek) !== week) return undefined;
  return plan.meals.find(m => String(m.day) === day && m.slot === slot)?.recipeId;
}

// Drops this week's ticks whose day and slot no longer hold the same recipe. Other weeks stay.
export function pruneEaten(eaten: string[] | undefined, week: number, before: Plan | null, after: Plan) {
  return (eaten ?? []).filter(key => {
    if (Number(key.split(':')[0]) !== week) return true;
    const was = recipeAt(before, week, key);
    return was !== undefined && was === recipeAt(after, week, key);
  });
}
