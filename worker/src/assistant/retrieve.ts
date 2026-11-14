import recipesJson from '../../../data/recipes.json';
import catalog from '../../../data/catalog.json';
import type { Inputs, Recipe } from '../../../packages/engine/src/types';
import type { Env } from '../http';

const recipes = recipesJson as Recipe[];
const names = new Map(catalog.products.map(p => [p.id, p.name]));
const documents = recipes.map(r => `${r.name}. ${r.description}. ${r.ingredients.map(i => names.get(i.productId) ?? i.productId).join(', ')}`);
let vectors: Promise<number[][]> | undefined;
const tokens = (text: string) => new Set(text.toLowerCase().match(/[a-z]+/g) ?? []);

async function embed(text: string[], env: Env): Promise<number[][]> {
  const output = await env.AI.run('@cf/baai/bge-small-en-v1.5', { text }) as { data?: number[][] };
  if (!Array.isArray(output?.data) || output.data.length !== text.length || output.data.some(v => !Array.isArray(v) || !v.length || v.some(n => !Number.isFinite(n)))) throw new Error('Invalid embeddings');
  return output.data;
}

function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Embedding dimensions differ');
  const norm = Math.hypot(...a) * Math.hypot(...b);
  return norm ? a.reduce((sum, n, i) => sum + n * b[i], 0) / norm : 0;
}

export async function retrieve(query: string, inputs: Inputs, env?: Env): Promise<Recipe[]> {
  const eligible = recipes.map((r, i) => ({ r, i })).filter(({ r }) => r.cookMinutes <= inputs.maxCookMinutes && !r.contains.some(t => inputs.avoid.includes(t)) && !inputs.excludedRecipeIds.includes(r.id) && !r.ingredients.some(i => inputs.excludedProductIds.includes(i.productId)));
  const words = tokens(query);
  const keyword = eligible.map(item => {
    const r = item.r;
    const tags = `${r.perServing.protein >= 30 ? 'high protein' : ''} ${r.perServing.carbs * 4 >= r.perServing.kcal * 0.45 ? 'carb rich' : ''}`;
    const haystack = tokens(`${documents[item.i]} ${r.mealTypes.join(' ')} ${r.contains.join(' ')} ${tags}`);
    return { ...item, score: [...words].filter(w => haystack.has(w)).length };
  }).sort((a, b) => b.score - a.score);
  if (!env || !eligible.length) return keyword.slice(0, 3).map(x => x.r);
  try {
    // Share in-flight work; retry failed batches on a later request.
    vectors ??= embed(documents, env).catch(error => {
      vectors = undefined;
      throw error;
    });
    const [all, queries] = await Promise.all([vectors, embed([query], env)]);
    const dense = [...eligible].sort((a, b) => cosine(queries[0], all[b.i]) - cosine(queries[0], all[a.i]));
    return keyword.map((item, rank) => ({ ...item, fused: 1 / (61 + rank) + 1 / (61 + dense.findIndex(d => d.i === item.i)) })).sort((a, b) => b.fused - a.fused).slice(0, 3).map(x => x.r);
  } catch {
    return keyword.slice(0, 3).map(x => x.r);
  }
}
