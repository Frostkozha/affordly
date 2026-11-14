// Runs the optimizer off the main thread so the page stays responsive while it solves.
import { initEngine, solve } from '@affordly/engine';
import type { Catalog, Inputs, PantryItem, Recipe, SolveResult } from '@affordly/engine';
import wasmUrl from 'highs/runtime?url';

export interface SolveRequest { id: number; inputs: Inputs; catalog: Catalog; recipes: Recipe[]; pantry: PantryItem[] }
export interface SolveReply { id: number; result?: SolveResult; error?: string }

const ready = initEngine(wasmUrl);

self.onmessage = async (event: MessageEvent<SolveRequest>) => {
  const { id, inputs, catalog, recipes, pantry } = event.data;
  try {
    await ready;
    postMessage({ id, result: solve(inputs, catalog, recipes, pantry) } satisfies SolveReply);
  } catch (error) {
    postMessage({ id, error: error instanceof Error ? error.message : 'Solver failed' } satisfies SolveReply);
  }
};
