import { createElement, createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AccountState, Inputs, PantryItem, SolveResult } from '@affordly/engine';
import { emptyState, loadState, saveState } from './account';
import { solvePlan } from './engine';
import { defaultInputs } from './config';

interface Store {
  state: AccountState;
  inputs: Inputs;
  result: SolveResult | null;
  ready: boolean;
  solving: boolean;
  solveError: string | null;
  retry: () => void;
  reloadAccount: () => Promise<void>;
  sample: boolean;
  swaps: number;
  recordSwap: () => void;
  setInputs: (inputs: Inputs) => void;
  run: (inputs?: Inputs, pantry?: PantryItem[], week?: number) => Promise<SolveResult>;
  setPlus: (plus: boolean) => void;
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
    const timer = setTimeout(() => {
      void saveState(state);
    }, 500);
    return () => clearTimeout(timer);
  }, [state, ready]);
  const run = async (inputs = state.inputs ?? defaultInputs, pantry = state.pantry, week = state.week) => {
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
      setResult(next);
      setState(s => ({
        ...s,
        inputs,
        pantry,
        week,
        currentPlan: next.ok ? next.plan : null,
        history: next.ok ?
          [
            ...s.history.filter(h => h.week !== week),
            {
              week,
              basketCost: next.plan.basketCost,
              checkoutGap: next.plan.checkoutGap,
              pantryUsedValue: next.plan.pantryUsedValue
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
      result,
      ready,
      sample,
      swaps,
      recordSwap: () => setSwaps(s => s + 1),
      setInputs: inputs => setState(s => ({
        ...s,
        inputs
      })),
      run,
      setPlus: plus => setState(s => ({
        ...s,
        plus
      })),
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
