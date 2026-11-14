import { createElement, createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AccountState, Inputs, PantryItem, SolveResult } from '@affordly/engine';
import { emptyState, loadState, saveState, cacheState } from './account';
import { solvePlan } from './engine';
import { defaultInputs } from './config';
import { readTaste } from './taste';
import { pruneEaten } from './eaten';

interface Store {
  state: AccountState;
  inputs: Inputs;
  taste: { liked: string[]; skipped: string[] };
  result: SolveResult | null;
  ready: boolean;
  solving: boolean;
  solveError: string | null;
  retry: () => void;
  reloadAccount: () => Promise<void>;
  sample: boolean;
  revealPlan: boolean;
  reprice: () => Promise<SolveResult>;
  swaps: number;
  recordSwap: () => void;
  setInputs: (inputs: Inputs) => void;
  toggleEaten: (key: string) => void;
  /** keepOnFail: when the new inputs do not fit, leave the current plan and inputs as they were. */
  run: (inputs?: Inputs, pantry?: PantryItem[], week?: number, reveal?: boolean, keepOnFail?: boolean) => Promise<SolveResult>;
  setPlus: (plus: boolean) => Promise<void>;
  useSample: () => Promise<void>;
}

const Context = createContext<Store | null>(null);

export function StoreProvider({ children }: {
  children: ReactNode;
}) {
  const [state, setState] = useState<AccountState>(emptyState);
  const [result, setResult] = useState<SolveResult | null>(null);
  const [ready, setReady] = useState(false);
  const [sample, setSample] = useState(false);
  const [revealPlan, setRevealPlan] = useState(true);
  const generation = useRef(0);
  const [solving, setSolving] = useState(false);
  const [solveError, setSolveError] = useState<string | null>(null);
  const lastRun = useRef<{
    inputs: Inputs;
    pantry: PantryItem[];
    week: number;
  } | null>(null);
  const reloadAccount = async () => {
    ++generation.current;
    const saved = await loadState();
    setState(saved);
    setResult(saved.currentPlan ? { ok: true, plan: saved.currentPlan } : null);
    setSolveError(null);
    setSolving(false);
  };
  const [swaps, setSwaps] = useState(0);
  useEffect(() => {
    let active = true;
    void loadState().then(s => {
      if (active) {
        setState(s);
        if (s.currentPlan)
          setResult({
            ok: true,
            plan: s.currentPlan
          });
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!ready)
      return;
    cacheState(state);
    const timer = setTimeout(() => {
      void saveState(state);
    }, 500);
    return () => clearTimeout(timer);
  }, [state, ready]);
  const run = async (inputs = state.inputs ?? defaultInputs, pantry = state.pantry,
    week = state.week, reveal = true, keepOnFail = false) => {
    const previous = result;
    setRevealPlan(reveal);
    const version = ++generation.current;
    lastRun.current = {
      inputs,
      pantry,
      week
    };
    setSolving(true);
    setSolveError(null);
    setResult(null);
    try {
      const next = await solvePlan({
        ...inputs,
        workouts: state.plus ? inputs.workouts : []
      }, pantry);
      if (version !== generation.current)
        return next;
      if (!next.ok && keepOnFail) {
        setResult(previous);
        return next;
      }
      setResult(next);
      setState(s => ({
        ...s,
        inputs,
        pantry,
        week,
        currentPlan: next.ok ? next.plan : null,
        eaten: next.ok ?
          pruneEaten(s.eaten, week, s.week === week ? s.currentPlan : null, next.plan) :
          s.eaten,
        history: next.ok ?
          [
            ...s.history.filter(h => h.week !== week),
            {
              week,
              basketCost: next.plan.basketCost,
              checkoutGap: next.plan.checkoutGap,
              pantryUsedValue: next.plan.pantryUsedValue,
              budget: inputs.budget
            }
          ].sort((a, b) => a.week - b.week) :
          s.history
      }));
      return next;
    } catch (error) {
      if (version === generation.current) {
        setSolveError(error instanceof Error ? error.message : 'Could not price your week.');
      }
      throw error;
    } finally {
      if (version === generation.current)
        setSolving(false);
    }
  };
  return createElement(Context.Provider, {
    value: {
      state,
      solving,
      solveError,
      reloadAccount,
      retry: () => {
        const previous = lastRun.current;
        if (previous)
          void run(previous.inputs, previous.pantry, previous.week).catch(() => { });
      },
      inputs: state.inputs ?? defaultInputs,
      taste: readTaste(state.inputs ?? defaultInputs),
      result,
      ready,
      sample: sample && JSON.stringify(state.inputs) === JSON.stringify(defaultInputs),
      revealPlan,
      reprice: () => run(undefined, undefined, undefined, false),
      swaps,
      recordSwap: () => setSwaps(s => s + 1),
      setInputs: inputs => setState(s => ({
        ...s,
        inputs
      })),
      toggleEaten: key => setState(s => ({
        ...s,
        eaten: s.eaten?.includes(key) ? s.eaten.filter(k => k !== key) : [...(s.eaten ?? []), key]
      })),
      run,
      setPlus: async plus => {
        await saveState({ ...state, plus });
        setState(current => ({ ...current, plus }));
      },
      useSample: async () => {
        setSample(true);
        await run(structuredClone(defaultInputs), [], 1);
      }
    }
  }, children);
}

export function useStore() {
  const store = useContext(Context);
  if (!store)
    throw new Error('StoreProvider is missing');
  return store;
}
