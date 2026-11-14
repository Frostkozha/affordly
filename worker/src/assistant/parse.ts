import type { Inputs } from '../../../packages/engine/src/types';

export const avoidTags = ['fish', 'meat', 'poultry', 'pork', 'dairy', 'egg', 'gluten', 'nuts', 'soy'];

export function parse(message: string, inputs: Inputs): Inputs {
  const asked = { ...inputs, avoid: [...inputs.avoid] };
  const fields: [keyof Pick<Inputs, 'budget' | 'proteinPerDay' | 'kcalPerDay' | 'maxCookMinutes'>, RegExp, number, number][] = [
    ['budget', /(?:\$\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*dollars?\b)/i, 20, 400],
    ['proteinPerDay', /(\d+(?:\.\d+)?)\s*g(?:rams?)?\s*(?:of\s+)?protein\b/i, 40, 300],
    ['kcalPerDay', /(\d+(?:\.\d+)?)\s*(?:kcal|calories)\b/i, 1200, 4500],
    ['maxCookMinutes', /(\d+(?:\.\d+)?)\s*minutes?\b/i, 10, 120],
  ];
  for (const [key, pattern, min, max] of fields) {
    const match = message.match(pattern);
    if (match) asked[key] = Math.min(max, Math.max(min, Number(match[1] ?? match[2])));
  }
  for (const tag of avoidTags) {
    if (new RegExp(`\\b(?:no|without|avoid)\\s+${tag}\\b`, 'i').test(message)) asked.avoid.push(tag);
  }
  if (/\bvegetarian\b/i.test(message)) asked.avoid.push('meat', 'poultry', 'pork', 'fish');
  asked.avoid = [...new Set(asked.avoid)];
  return asked;
}
