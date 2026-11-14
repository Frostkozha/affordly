export interface Body {
  sex: 'female' | 'male';
  age: number;
  heightCm: number;
  weightKg: number;
  activity: 1.2 | 1.375 | 1.55 | 1.725;
  goal: -0.15 | 0 | 0.1;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Mifflin-St Jeor estimate, rounded for the manual target fields. */
export function suggestTargets(b: Body) {
  const bmr = 10 * b.weightKg + 6.25 * b.heightCm - 5 * b.age + (b.sex === 'male' ? 5 : -161);
  const kcalPerDay = clamp(Math.round(bmr * b.activity * (1 + b.goal) / 50) * 50, 1200, 4000);
  const proteinPerDay = clamp(Math.round(b.weightKg * (b.goal < 0 ? 1.8 : 1.6) / 5) * 5, 40, 300);
  return { kcalPerDay, proteinPerDay, ...splitRest(kcalPerDay, proteinPerDay) };
}

export const macroLimits = { carbs: [50, 600], fat: [20, 200] } as const;

/** Fat takes 28% of the calories; carbs take what protein and fat leave. */
export function splitRest(kcal: number, protein: number): { carbsPerDay: number; fatPerDay: number } {
  const fatPerDay = clamp(Math.round(kcal * .28 / 9 / 5) * 5, ...macroLimits.fat);
  return { fatPerDay, carbsPerDay: clamp(Math.round((kcal - protein * 4 - fatPerDay * 9) / 4 / 5) * 5, ...macroLimits.carbs) };
}

/** Calories the three macro targets add up to: 4 per gram of protein and carbs, 9 per gram of fat. */
export const macroKcal = (protein: number, carbs: number, fat: number) => protein * 4 + carbs * 4 + fat * 9;
