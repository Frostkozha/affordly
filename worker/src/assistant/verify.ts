export function numbers(text: string): number[] {
  return [...text.replace(/(?<=\d),(?=\d{3}\b)/g, '').matchAll(/-?\$?\s*\d+(?:\.\d+)?/g)].map(m => Number(m[0].replace(/[$\s]/g, '')));
}

export function verify(text: string, facts: string, infeasible: boolean): boolean {
  if (!text.trim() || text.length > 600) return false;
  if (infeasible && /\b(yes|fits|works|you can)\b/i.test(text)) return false;
  const allowed = new Set([...numbers(facts), 1, 2, 3, 4, 5, 6, 7, 21].map(n => Math.round(n * 100)));
  return numbers(text).every(n => allowed.has(Math.round(n * 100)));
}
