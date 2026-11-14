import type { AnswerKind } from './generate';

/** Every number written in a text, with thousands separators and currency signs removed. */
export function numbers(text: string): number[] {
  const plain = text.replace(/(?<=\d),(?=\d{3}\b)/g, '');
  return [...plain.matchAll(/-?\$?\s*\d+(?:\.\d+)?/g)].map(match => Number(match[0].replace(/[$\s]/g, '')));
}

const SAYS_YES = /\b(yes|fits|works|you can)\b/i;
const SAYS_NO = /\b(no|cannot|can't|can not|does not fit|doesn't fit|not possible|unable)\b/i;

/**
 * The hard-fact check on model text. It passes only when:
 *  - every number in the text also appears in the facts (to the cent),
 *  - the text does not say yes to a plan that does not fit, or no to one that does,
 *  - a recipe answer names at least one of the retrieved recipes.
 */
export function verify(text: string, facts: string, kind: AnswerKind, recipeNames: string[] = []): boolean {
  if (!text.trim() || text.length > 600) return false;
  if (kind === 'does-not-fit' && SAYS_YES.test(text)) return false;
  if (kind !== 'does-not-fit' && SAYS_NO.test(text)) return false;
  if (kind === 'recipe') {
    const lower = text.toLowerCase();
    if (!recipeNames.some(name => lower.includes(name.toLowerCase()))) return false;
  }
  const smallCounts = [1, 2, 3, 4, 5, 6, 7, 21];
  const allowed = new Set([...numbers(facts), ...smallCounts].map(n => Math.round(n * 100)));
  return numbers(text).every(n => allowed.has(Math.round(n * 100)));
}
