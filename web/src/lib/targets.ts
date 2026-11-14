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
export function suggestTargets(b: Body): { kcalPerDay: number; proteinPerDay: number } {
  const bmr = 10 * b.weightKg + 6.25 * b.heightCm - 5 * b.age + (b.sex === 'male' ? 5 : -161);
  return {
    kcalPerDay: clamp(Math.round(bmr * b.activity * (1 + b.goal) / 50) * 50, 1200, 4000),
    proteinPerDay: clamp(Math.round(b.weightKg * (b.goal < 0 ? 1.8 : 1.6) / 5) * 5, 40, 300)
  };
}
