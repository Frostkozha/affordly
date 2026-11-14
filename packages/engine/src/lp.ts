// Thin adapter over the HiGHS mixed-integer solver (WebAssembly).
// The model shape is the plain object the optimizer builds: named constraints with
// min/max/equal bounds, and variables as maps of constraint name -> coefficient.
import highsLoader from 'highs';

export interface Model {
  constraints: Record<string, { min?: number; max?: number; equal?: number }>;
  variables: Record<string, Record<string, number>>; // 'objective' holds the cost coefficient
  ints: Record<string, number>;
}

type Highs = Awaited<ReturnType<typeof highsLoader>>;
let highs: Highs | undefined;

/** Load the solver once. In a browser pass the URL of highs.wasm. */
export async function initEngine(wasmUrl?: string): Promise<void> {
  if (!highs) highs = await highsLoader(wasmUrl ? { locateFile: () => wasmUrl } : undefined);
}

const num = (n: number) => (Math.abs(n) < 1e-12 ? '0' : n.toFixed(9).replace(/\.?0+$/, ''));
const terms = (pairs: [string, number][]) =>
  pairs.map(([name, c], i) => `${c < 0 ? '-' : i ? '+' : ''} ${num(Math.abs(c))} ${name}`).join(' ') || '0 x0dummy';

/** Returns variable values, or null when there is no solution. Exact unless a gap is given. */
export function solveModel(model: Model, relativeGap = 0): Record<string, number> | null {
  if (!highs) throw new Error('Call initEngine() before solving.');
  const names = Object.keys(model.variables);
  const lines = ['Minimize', ` obj: ${terms(names.map(n => [n, model.variables[n].objective ?? 0] as [string, number]).filter(([, c]) => c !== 0))}`, 'Subject To'];
  let row = 0;
  for (const [key, bound] of Object.entries(model.constraints)) {
    const pairs = names.map(n => [n, model.variables[n][key] ?? 0] as [string, number]).filter(([, c]) => c !== 0);
    if (!pairs.length) {
      // A constraint no variable touches is either trivially true or makes the model infeasible.
      if ((bound.min ?? -Infinity) > 0 || (bound.max ?? Infinity) < 0 || (bound.equal ?? 0) !== 0) return null;
      continue;
    }
    const lhs = terms(pairs);
    if (bound.equal !== undefined) lines.push(` c${row++}: ${lhs} = ${num(bound.equal)}`);
    if (bound.min !== undefined && Number.isFinite(bound.min)) lines.push(` c${row++}: ${lhs} >= ${num(bound.min)}`);
    if (bound.max !== undefined && Number.isFinite(bound.max)) lines.push(` c${row++}: ${lhs} <= ${num(bound.max)}`);
  }
  const ints = names.filter(n => model.ints[n]);
  if (ints.length) lines.push('General', ' ' + ints.join(' '));
  lines.push('End');
  const result = highs.solve(lines.join('\n'), { mip_rel_gap: relativeGap, time_limit: 10, output_flag: false });
  if (result.Status !== 'Optimal') return null;
  const values: Record<string, number> = {};
  for (const n of names) values[n] = (result.Columns[n] as { Primal: number } | undefined)?.Primal ?? 0;
  return values;
}
