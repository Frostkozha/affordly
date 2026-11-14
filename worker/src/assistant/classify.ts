import type { AssistantIntent } from '../../../packages/engine/src/api';
import type { Env } from '../http';
import { model } from './model';

const medical = new RegExp('\\b(' + [
  'diagnos\\w*|disease|diabet\\w*|cancer|hypertension|kidney|celiac',
  'medications?|medicines?|insulin|prescription|pregnan\\w*|eating.disorders?',
  'anorexia|bulimia|ozempic|wegovy|mounjaro|zepbound|semaglutide|tirzepatide|weight.loss.drugs?',
].join('|') + ')\\b', 'i');
const changes = /\b(protein|calories|kcal|minutes|avoid|without|no\s+\w+|workout|vegetarian)\b/i;
const instruction = new RegExp('\\b(change|set|want|need|increase|reduce|add|remove|make|use|'
  + 'avoid|without|no|vegetarian)\\b|\\d', 'i');

export function classifyRules(message: string): AssistantIntent | null {
  if (medical.test(message)) return 'medical';
  if (/\$\s*\d|\b\d+(?:\.\d+)?\s*dollars?\b|\b(budget|afford|cheaper)\b/i.test(message)) {
    return 'budget';
  }
  if (changes.test(message) && instruction.test(message)) return 'plan-change';
  if (/\b(recipe|cook|make|meal|breakfast|lunch|dinner)\b|what can I eat/i.test(message)) return 'recipe';
  return null;
}

export async function classify(message: string, env?: Env): Promise<AssistantIntent> {
  const rule = classifyRules(message);
  if (rule) return rule;
  if (!env) return 'off-topic';
  try {
    const label = await model(env, [
      { role: 'system', content: 'Reply with one label: budget, plan-change, recipe, off-topic, medical.' },
      { role: 'user', content: message },
    ], 0);
    const labels = ['budget', 'plan-change', 'recipe', 'off-topic', 'medical'];
    if (labels.includes(label)) return label as AssistantIntent;
  } catch { /* Unknown intent stays outside the product scope. */ }
  return 'off-topic';
}
