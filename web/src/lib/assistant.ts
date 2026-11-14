import type { AssistantRequest, AssistantResponse, Inputs, PantryItem } from '@affordly/engine';
import { getRecipes, solvePlan } from './engine';
import { getAccount } from './account';
import { classifyRules } from '../../../worker/src/assistant/classify';
import { parse } from '../../../worker/src/assistant/parse';
import { template } from '../../../worker/src/assistant/templates';

async function post(base: string, body: AssistantRequest): Promise<AssistantResponse> {
  const response = await fetch(`${base.replace(/\/$/, '')}/api/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('Assistant request failed');
  const reply = await response.json() as AssistantResponse;
  if (!reply || typeof reply.text !== 'string' || !Array.isArray(reply.recipeIds) || !['template', 'model'].includes(reply.source)) throw new Error('Invalid assistant response');
  return reply;
}

export async function ask(message: string, inputs: Inputs, pantry: PantryItem[]): Promise<AssistantResponse> {
  const base = import.meta.env.VITE_API_BASE;
  if (base) {
    try {
      const body = { accountId: getAccount()?.id ?? '', message, inputs, pantry };
      const reply = await post(base, body);
      if (!reply.needsSolve) return reply;
      const asked = reply.needsSolve;
      const result = await solvePlan(asked, pantry);
      return await post(base, { ...body, asked, result });
    } catch { /* Keep meal planning available without the API. */ }
  }
  const intent = classifyRules(message) ?? 'off-topic';
  const asked = parse(message, inputs);
  const recipes = getRecipes().filter(r => r.cookMinutes <= asked.maxCookMinutes && !r.contains.some(t => asked.avoid.includes(t)) && !asked.excludedRecipeIds.includes(r.id) && !r.ingredients.some(i => asked.excludedProductIds.includes(i.productId))).slice(0, 3);
  const result = intent === 'budget' || intent === 'plan-change' ? await solvePlan(asked, pantry) : undefined;
  return template(intent, asked, result, recipes);
}
