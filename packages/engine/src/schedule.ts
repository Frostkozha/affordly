import type { Inputs, MealType, PlannedMeal, Recipe, Slot } from './types';

export const minute = (time: string): number => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
export const carbRich = (r: Recipe): boolean => r.perServing.carbs * 4 >= r.perServing.kcal * .45 && r.perServing.fat * 9 <= r.perServing.kcal * .3;
export interface Position { day: number; slot: Slot; time: string; type: MealType; }
const clock = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
export function positions(inputs: Inputs): Position[] | null {
  const result: Position[] = [];
  for (let day = 0; day < 7; day++) {
    const slots: Position[] = (['breakfast', 'lunch', 'dinner'] as const).map((type, i) => ({ day, slot: type, type, time: ['08:00', '13:00', '19:00'][i] }));
    for (const w of inputs.workouts.filter(w => w.day === day)) {
      const start = minute(w.start), pre = start - 150, post = start + w.minutes;
      if (pre < 0 || post >= 1440) return null;
      const available = slots.filter(s => s.slot === s.type);
      const a = available.sort((a, b) => Math.abs(minute(a.time) - pre) - Math.abs(minute(b.time) - pre))[0];
      if (!a) return null;
      a.slot = 'pre-workout'; a.time = clock(pre);
      const b = available.filter(s => s !== a).sort((a, b) => Math.abs(minute(a.time) - post) - Math.abs(minute(b.time) - post))[0];
      if (!b) return null;
      b.slot = 'post-workout'; b.time = clock(post);
      // A regular meal during the session would otherwise precede the recovery meal.
      for (const s of slots) if (s.slot === s.type && minute(s.time) > start && minute(s.time) < post) s.time = clock(start);
    }
    result.push(...slots);
  }
  return result;
}
export function fits(r: Recipe, p: Position): boolean {
  return r.mealTypes.includes(p.type) && (p.slot !== 'pre-workout' || carbRich(r)) && (p.slot !== 'post-workout' || r.perServing.protein >= 30);
}
export function schedule(inputs: Inputs, recipes: Recipe[], counts: number[]): PlannedMeal[] | null {
  const ps = positions(inputs);
  if (!ps) return null;
  const items = recipes.flatMap((r, i) => Array.from({ length: counts[i] }, () => r));
  if (items.length !== 21) return null;
  const score = (assignment: Recipe[]) => {
    let loss = 0;
    for (let d = 0; d < 7; d++) {
      const rs = assignment.filter((_, i) => ps[i].day === d);
      const kcal = rs.reduce((s, r) => s + r.perServing.kcal, 0), protein = rs.reduce((s, r) => s + r.perServing.protein, 0);
      loss += Math.max(0, inputs.kcalPerDay * .8 - kcal, kcal - inputs.kcalPerDay * 1.2) + 10 * Math.max(0, inputs.proteinPerDay * .85 - protein);
    }
    return loss;
  };
  for (let attempt = 0; attempt < 24; attempt++) {
    const order = ps.map((_, i) => i).sort((a, b) => items.filter(r => fits(r, ps[a])).length - items.filter(r => fits(r, ps[b])).length);
    const owner = Array(items.length).fill(-1);
    const match = (p: number, seen: Set<number>): boolean => {
      for (let k = 0; k < items.length; k++) {
        const j = (k + attempt * 7 + p * 3) % items.length;
        if (seen.has(j) || !fits(items[j], ps[p])) continue;
        seen.add(j);
        if (owner[j] < 0 || match(owner[j], seen)) { owner[j] = p; return true; }
      }
      return false;
    };
    if (!order.every(p => match(p, new Set()))) continue;
    const assigned: Recipe[] = [];
    owner.forEach((p, j) => { assigned[p] = items[j]; });
    let best = score(assigned);
    for (let pass = 0; pass < 30 && best > .001; pass++) {
      let changed = false;
      for (let a = 0; a < 21; a++) for (let b = a + 1; b < 21; b++) {
        if (!fits(assigned[a], ps[b]) || !fits(assigned[b], ps[a])) continue;
        [assigned[a], assigned[b]] = [assigned[b], assigned[a]];
        const next = score(assigned);
        if (next < best - .001) { best = next; changed = true; }
        else [assigned[a], assigned[b]] = [assigned[b], assigned[a]];
      }
      if (!changed) break;
    }
    if (best < .001) return ps.map((p, i) => ({ day: p.day, slot: p.slot, time: p.time, recipeId: assigned[i].id, servings: 1 }));
  }
  return null;
}
