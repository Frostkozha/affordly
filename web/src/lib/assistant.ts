import type { AssistantResponse, Inputs, PantryItem } from '@affordly/engine';
import { getRecipes, solvePlan } from './engine';
import { demoTerms } from './mock';
export async function ask(message: string, inputs: Inputs, pantry: PantryItem[]): Promise<AssistantResponse> {
  const amount = message.match(/\$\s*(\d+(?:\.\d{1,2})?)/);
  if (amount && Number(amount[1]) < demoTerms.minimumBudget) {
    const result = await solvePlan({ ...inputs, budget: Number(amount[1]) }, pantry);
    if (!result.ok) return { intent: 'budget', text: result.reason, refused: true, recipeIds: [], proposedInputs: result.alternatives.find(a => a.kind === 'min-budget')?.inputs, result, source: 'template' };
  }
  return { intent: 'recipe', text: 'Here are two simple meals from the demo week. Open a recipe to see its ingredients and steps. Your basket prices whole packages, including what is left over.', refused: false, recipeIds: getRecipes().filter(r => !r.contains.some(t => inputs.avoid.includes(t))).slice(0, 2).map(r => r.id), source: 'template' };
}
