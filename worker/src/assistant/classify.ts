import type { AssistantIntent } from '../../../packages/engine/src/api';
import type { Env } from '../http';

export function classifyRules(message: string): AssistantIntent | null {
  if (/\b(diagnos\w*|disease|diabet\w*|cancer|hypertension|kidney|celiac|medications?|medicines?|insulin|prescription|pregnan\w*|eating.disorders?|anorexia|bulimia|ozempic|wegovy|mounjaro|zepbound|semaglutide|tirzepatide|weight.loss.drugs?)\b/i.test(message)) return 'medical';
  if (/\$\s*\d|\b\d+(?:\.\d+)?\s*dollars?\b|\b(budget|afford|cheaper)\b/i.test(message)) return 'budget';
  if (/\b(protein|calories|kcal|minutes|avoid|without|no\s+\w+|workout|vegetarian)\b/i.test(message) && /\b(change|set|want|need|increase|reduce|add|remove|make|use|avoid|without|no|vegetarian)\b|\d/i.test(message)) return 'plan-change';
  if (/\b(recipe|cook|make|meal|breakfast|lunch|dinner)\b|what can I eat/i.test(message)) return 'recipe';
  return null;
}

export async function classify(message: string, env?: Env): Promise<AssistantIntent> {
  const rule = classifyRules(message);
  if (rule) return rule;
  if (!env) return 'off-topic';
  try {
    const output = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', { messages: [
      { role: 'system', content: 'Classify the user message. Reply with exactly one label: budget, plan-change, recipe, off-topic, medical.' },
      { role: 'user', content: message },
    ], max_tokens: 12, temperature: 0 });
    const label = (output as { response?: string })?.response?.trim();
    if (['budget', 'plan-change', 'recipe', 'off-topic', 'medical'].includes(label ?? '')) return label as AssistantIntent;
  } catch { /* Unknown intent stays outside the product scope. */ }
  return 'off-topic';
}
