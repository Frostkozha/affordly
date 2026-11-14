import type { AssistantIntent, AssistantResponse } from '../../../packages/engine/src/api';
import type { Inputs, Recipe, SolveResult } from '../../../packages/engine/src/types';

export function template(intent: AssistantIntent, asked: Inputs,
  result?: SolveResult, recipes: Recipe[] = []): AssistantResponse {
  const action = intent === 'recipe' ? 'find-recipes'
    : intent === 'budget' || intent === 'plan-change' ? 'change-inputs' : intent;
  const base: AssistantResponse = {
    intent, action, suggestions: [], text: '', refused: false,
    recipeIds: recipes.map(r => r.id), source: 'template',
  };
  if (intent === 'off-topic') return { ...base, recipeIds: [], refused: true, text: 'I only help with planning meals inside a grocery budget. Ask me about your budget, your plan or a recipe.' };
  if (intent === 'medical') return { ...base, recipeIds: [], refused: true, text: "I can't give medical or dietary advice. Affordly is a planning tool. For health questions, talk to a doctor or a registered dietitian." };
  if (intent === 'budget' || intent === 'plan-change') {
    if (!result) return { ...base, recipeIds: [], needsSolve: [asked] };
    if (!result.ok) return { ...base, result, refused: true, text: [result.reason, ...result.alternatives.map(a => a.headline)].join('\n'), proposedInputs: (result.alternatives.find(a => a.kind === 'min-budget') ?? result.alternatives[0])?.inputs };
    const p = result.plan;
    return { ...base, result, proposedInputs: asked, text: `Yes: this fits. Receipt $${p.basketCost.toFixed(2)} of $${asked.budget.toFixed(2)} budget; recipe price $${p.gramCost.toFixed(2)}; Checkout Gap $${p.checkoutGap.toFixed(2)}; ${Math.round(p.average.protein)} g protein, ${Math.round(p.average.carbs)} g carbs, ${Math.round(p.average.fat)} g fat and ${Math.round(p.average.kcal)} kcal a day on average.` };
  }
  return { ...base, text: recipes.length ? `Here are recipes that match your plan: ${recipes.map(r => `${r.name}, ${r.cookMinutes} minutes, ${Math.round(r.perServing.kcal)} kcal and ${Math.round(r.perServing.protein)} g protein per serving`).join('; ')}.` : 'No recipes match your avoid tags and cooking time.' };
}

export function facts(asked: Inputs, result: SolveResult | undefined, recipes: Recipe[]): string {
  const lines = [`Budget: ${asked.budget}`, `Daily protein: ${asked.proteinPerDay}`, `Daily kcal: ${asked.kcalPerDay}`, `Daily carbs: ${asked.carbsPerDay ?? 'open'}`, `Daily fat: ${asked.fatPerDay ?? 'open'}`, `Cooking minutes: ${asked.maxCookMinutes}`];
  if (result?.ok) {
    const p = result.plan;
    lines.push('Plan fits: yes', `Receipt: ${p.basketCost.toFixed(2)}`, `Recipe price: ${p.gramCost.toFixed(2)}`, `Checkout Gap: ${p.checkoutGap.toFixed(2)}`, `Average protein: ${Math.round(p.average.protein)}`, `Average carbs: ${Math.round(p.average.carbs)}`, `Average fat: ${Math.round(p.average.fat)}`, `Average kcal: ${Math.round(p.average.kcal)}`);
  } else if (result) {
    lines.push('Plan fits: no', result.reason);
    for (const a of result.alternatives) lines.push(a.headline, `Alternative budget: ${a.inputs.budget}; protein: ${a.inputs.proteinPerDay}; minutes: ${a.inputs.maxCookMinutes}`);
  }
  for (const r of recipes) lines.push(`${r.name}: ${r.cookMinutes} minutes; ${Math.round(r.perServing.kcal)} kcal; ${Math.round(r.perServing.protein)} g protein per serving`);
  return lines.join('\n');
}
