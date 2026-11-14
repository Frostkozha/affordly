import type { Inputs } from '@affordly/engine';
export function readTaste(inputs: Inputs) {
  return { liked: inputs.likedRecipeIds ?? [], skipped: inputs.excludedRecipeIds };
}
export function decide(inputs: Inputs, id: string, like: boolean): Inputs {
  return {
    ...inputs,
    likedRecipeIds: [...(inputs.likedRecipeIds ?? []).filter(value => value !== id), ...(like ? [id] : [])],
    excludedRecipeIds: [...inputs.excludedRecipeIds.filter(value => value !== id), ...(like ? [] : [id])],
  };
}
export function shuffleRecipes<T>(items: T[]): T[] {
  let seed = 1;
  try {
    const stored = sessionStorage.getItem('affordly.discoverSeed');
    seed = stored ? Number(stored) : Math.floor(Math.random() * 2147483646) + 1;
    if (!Number.isInteger(seed) || seed <= 0 || seed >= 2147483647)
      seed = 1;
    sessionStorage.setItem('affordly.discoverSeed', String(seed));
  } catch { /* A deterministic order remains available without storage. */ }
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    seed = seed * 16807 % 2147483647;
    const j = seed % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
