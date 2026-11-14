import type { AnswerKind } from './generate';

/** Every number written in a text, with thousands separators and currency signs removed. */
export function numbers(text: string): number[] {
  const plain = text
    .replace(/(?<=\d),(?=\d{3}\b)/g, '')
    // List numbering ("1.", "2)", "Step 3") is layout, not a claim about the plan.
    .replace(/^\s*\d{1,2}[.)]\s/gm, '')
    .replace(/\b(step|option)\s+\d{1,2}\b:?/gi, '');
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
export function verify(text: string, facts: string, kind: AnswerKind | 'facts',
  recipeNames: string[] = []): boolean {
  if (!text.trim() || text.length > 4000) return false;
  if (kind === 'does-not-fit' && SAYS_YES.test(text)) return false;
  if (kind === 'fits' && SAYS_NO.test(text)) return false;
  if (kind === 'recipe' || recipeNames.length) {
    const lower = text.toLowerCase();
    if (!recipeNames.some(name => lower.includes(name.toLowerCase()))) return false;
  }
  const allowed = new Set(numbers(facts).map(n => Math.round(n * 100)));
  return numbers(text).every(n => allowed.has(Math.round(n * 100)));
}

/** Comparison claims are checked against their own scenario, never a neighbor's receipt. */
export function verifyComparison(text: string, facts: string): boolean {
  const split = (value: string) => value.split(/(?=Scenario \d+:)/).map(s => s.trim()).filter(Boolean);
  const expected = split(facts);
  const actual = split(text);
  if (expected.length !== actual.length) return false;
  return expected.every((fact, index) => {
    const label = `Scenario ${index + 1}:`;
    const kind = fact.startsWith(label + ' fits.') ? 'fits' : 'does-not-fit';
    const status = kind === 'fits' ? /\bfits\b/i : /does not fit|doesn't fit/i;
    return actual[index].startsWith(label) && status.test(actual[index])
      && verify(actual[index], fact, kind);
  });
}
