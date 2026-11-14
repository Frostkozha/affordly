import type { AssistantRequest, AssistantResponse } from '../../../packages/engine/src/api';
import type { Inputs, Recipe } from '../../../packages/engine/src/types';
import catalog from '../../../data/catalog.json';
import recipesJson from '../../../data/recipes.json';
import type { Route } from './route';
import { retrieve } from './retrieve';
import { scenarios } from './scenarios';
export { scenarios } from './scenarios';
import type { Env } from '../http';
import { resolveMeal } from './route';

const recipes = recipesJson as Recipe[];
const money = (n: number) => `$${n.toFixed(2)}`;
const product = (id: string) => catalog.products.find(p => p.id === id)!;

const productAbsent = (body: AssistantRequest, id: string) =>
  !!body.plan && !body.plan.basket.some(b => b.productId === id);

export function suggestions(route: Route): string[] {
  if (route.action === 'medical' || route.action === 'off-topic') {
    return ['Find a quick dinner', 'Explain my plan'];
  }
  if (route.action === 'find-recipes' || route.action === 'how-to-cook') {
    return ['Find a dinner without dairy', 'What can I cook with leftovers?'];
  }
  return ['Why is my gap so big?', 'What if $70 vs $90?', 'Find a quick dinner'];
}

function solvedFacts(body: AssistantRequest, route: Route, asked: Inputs[],
  reply: AssistantResponse): string[] {
  const results = body.results!;
  const lines: string[] = [];
  if (route.action === 'swap-product') {
    lines.push('Excluded product: ' + product(String(route.args.productId)).name + '.');
  }
  if (route.action === 'like-recipe' || route.action === 'dislike-recipe') {
    const name = recipes.find(r => r.id === route.args.recipeId)!.name;
    lines.push((route.action === 'like-recipe' ? 'Preferred recipe: ' : 'Excluded recipe: ') + name + '.');
  }
  if (route.action === 'add-workout') {
    const { day, start, kind, minutes } = route.args;
    lines.push('Workout: day ' + day + ', ' + start + ', ' + kind + ', ' + minutes + ' minutes.');
  }
    reply.results = results;
    reply.result = results[0];
    reply.options = [];
    results.forEach((r, index) => {
      const label = route.action === 'compare' ? `Scenario ${index + 1}:` : 'This plan';
      if (r.ok) {
        const p = r.plan;
        lines.push(`${label} fits. Receipt ${money(p.basketCost)}; budget ${money(asked[index].budget)}; `
          + `recipe price ${money(p.gramCost)}; Checkout Gap ${money(p.checkoutGap)}; `
          + `${Math.round(p.average.protein)} g protein and ${Math.round(p.average.kcal)} kcal daily.`);
        reply.options!.push({ label: route.action === 'compare' ? `Apply Scenario ${index + 1}` : 'Apply this plan',
          inputs: asked[index] });
      } else {
        lines.push(`${label} does not fit. ${r.reason}`);
        const minimum = r.alternatives.find(x => x.kind === 'min-budget');
        if (minimum) lines.push(`Cheapest plan that fits: ${money(minimum.plan.basketCost)}.`);
      }
    });
    reply.refused = results.every(r => !r.ok);
    reply.proposedInputs = reply.options[0]?.inputs;

  return lines;
}

function explainFacts(body: AssistantRequest, topic: unknown): string[] {
  let lines: string[] = [];
    const p = body.plan;
    if (!p) lines = ['Create a plan first so I can explain its actual receipt and leftovers.'];
    else {
      lines = [`Receipt ${money(p.basketCost)}; recipe price ${money(p.gramCost)}; `
        + `Checkout Gap ${money(p.checkoutGap)}; ${Math.round(p.average.protein)} g protein daily.`];
      if (topic === 'gap' || topic === 'leftovers') {
        lines.push('Whole packages leave unused ingredients; the gap prices that unused weight.');
        // Same rule as the Basket tab's "Where the gap comes from" (LeftoverTop3): every basket line,
        // ranked by unused money (package cost minus recipe price), top three.
        const items = [...p.basket].sort((x, y) => (y.cost - y.gramCost) - (x.cost - x.gramCost))
          .slice(0, 3);
        lines.push(...items.map(b => `${product(b.productId).name}: ${Math.round(b.gramsLeft)} g left, `
          + `${money(b.cost - b.gramCost)} unused.`));
      }
      if (topic === 'most-expensive') {
        lines.push(...[...p.basket].sort((x, y) => y.cost - x.cost).slice(0, 3)
          .map(b => `${product(b.productId).name}: ${money(b.cost)}.`));
      }
    }

  return lines;
}

async function recipeFacts(body: AssistantRequest, route: Route, env?: Env) {
  const a = route.args;
  let found: Recipe[] = [];
  let lines: string[] = [];
    const eligible = recipes.filter(r => r.cookMinutes <= body.inputs.maxCookMinutes
      && !r.contains.some(t => body.inputs.avoid.includes(t))
      && !body.inputs.excludedRecipeIds.includes(r.id)
      && !r.ingredients.some(i => body.inputs.excludedProductIds.includes(i.productId)));
    if (route.action === 'use-leftovers') {
      const pantry = body.plan?.pantryAfter ?? body.pantry;
      const weight = (r: Recipe) => r.ingredients.reduce((sum, i) => sum
        + Math.min(i.grams / r.servings, pantry.find(p => p.productId === i.productId)?.grams ?? 0), 0);
      found = eligible.filter(r => weight(r) > 0).sort((x, y) => weight(y) - weight(x)).slice(0, 3);
      lines = found.map(r => r.name + ': uses ' + weight(r).toFixed(1)
        + ' g of leftover pantry weight per portion.');
    } else {
      const filtered = eligible.filter(r => (!a.mealType || r.mealTypes.includes(a.mealType as never))
        && (!a.maxMinutes || r.cookMinutes <= Number(a.maxMinutes))
        && (!a.minProtein || r.perServing.protein >= Number(a.minProtein)));
      // Apply filters before ranking, so qualifying recipes cannot be lost in the top three.
      const excludedRecipeIds = recipes.filter(r => !filtered.includes(r)).map(r => r.id);
      found = await retrieve(String(a.query ?? body.message), { ...body.inputs, excludedRecipeIds }, env);
      lines = found.map(r => `${r.name}: ${r.cookMinutes} minutes; `
        + `${Math.round(r.perServing.protein)} g protein per portion.`);
    }
    if (!lines.length) lines = ['No recipes match these ingredients and preferences.'];
  return { found, lines };
}

export async function answer(body: AssistantRequest, route: Route, env?: Env): Promise<{
  reply: AssistantResponse; facts: string; names: string[];
}> {
  const a = route.args;
  const reply: AssistantResponse = {
    intent: 'plan-change', action: route.action, text: '', refused: false,
    recipeIds: [], source: 'template', suggestions: suggestions(route),
  };
  let lines: string[] = [];
  let found: Recipe[] = [];
  let names: string[] = [];
  const asked = body.asked ?? scenarios(body, route);
  if (route.action === 'medical' || route.action === 'off-topic') {
    reply.intent = route.action;
    reply.refused = true;
    lines = [route.action === 'medical'
      ? "I can't give medical advice. Please talk to a doctor or registered dietitian."
      : 'I help with grocery budgets, meal plans and recipes. Ask me about your week.'];
  } else if (route.action === 'add-workout' && !body.plus) {
    reply.paywall = true;
    lines = ['Workout-aware meal planning is a Plus feature. Open Plus to add your workout.'];
  } else if (route.action === 'swap-product' && productAbsent(body, String(a.productId))) {
    // Nothing to re-solve: the plan has no such product. Offer the exclusion for later plans only.
    const name = product(String(a.productId)).name.split(',')[0].toLowerCase();
    lines = [`Your plan already has no ${name}. I will keep it out of future plans.`];
    reply.options = [{ label: `Keep ${name} out`, inputs: asked[0] }];
    reply.proposedInputs = asked[0];
  } else if (asked.length) {
    if (!body.results) {
      reply.needsSolve = asked;
      return { reply, facts: '', names };
    }
    lines = solvedFacts(body, route, asked, reply);
  } else if (route.action === 'explain-plan') {
    lines = explainFacts(body, a.topic);
  } else if (route.action === 'price-lookup') {
    const products = (a.productIds as string[]).map(product);
    names = products.map(p => p.name);
    lines = products.map(p => `${p.name}: ${p.packageLabel}, ${p.packageGrams} g, ${money(p.price)}; `
      + `${money(p.price / p.packageGrams * 100)} per 100 g; `
      + `${(p.per100g.protein * p.packageGrams / 100 / p.price).toFixed(2)} g protein per dollar.`);
  } else if (route.action === 'how-to-cook') {
    // A reference like "first dinner" wins over the router's guess: it is read from the plan itself.
    const id = resolveMeal(body.message, body.plan) ?? a.recipeId;
    const r = recipes.find(r => r.id === id)!;
    found = [r];
    // Steps are written for the full recipe, so the ingredients are the full recipe too.
    lines = [`${r.name}: ingredients for the full recipe (makes ${r.servings} servings): `
      + r.ingredients.map(i => `${product(i.productId).name} ${Math.round(i.grams)} g`).join('; '),
    ...r.steps];
  } else {
    const selection = await recipeFacts(body, route, env);
    found = selection.found;
    lines = selection.lines;
  }
  reply.recipeIds = found.map(r => r.id);
  if (found.length) names = found.map(r => r.name);
  reply.text = lines.join('\n');
  return { reply, facts: reply.text, names };
}
