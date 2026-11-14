import './WeekTwo.css';
import { SolveStatus } from './SolveStatus';
import { useState } from 'react';
import type { PantryItem } from '@affordly/engine';
import { nextWeekPantry } from '../lib/engine';
import { useStore } from '../lib/store';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { BasketTable } from './BasketTable';
import { CheckoutGapCard } from './CheckoutGapCard';
import { Paywall } from './Paywall';
import { SimulateButton } from './SimulateButton';
import { LeftoverList } from './LeftoverList';
import { WasteAvoided } from './WasteAvoided';

export function WeekTwo({ locked, go }: {
  locked: (message?: string) => void;
  go: (tab: string) => void;
}) {
  const { state, result, run, solving, solveError, retry } = useStore();
  const [dropped, setDropped] = useState<PantryItem[]>([]);
  const plan = result?.ok ? result.plan : null;
  const simulate = async () => {
    if (!plan)
      return;
    try {
      const carry = nextWeekPantry(plan);
      setDropped(plan.pantryAfter.filter(p => p.daysLeft !== null && p.daysLeft <= 7));
      await run(undefined, carry, state.week + 1);
    } catch {
      // The shared solve state offers a retry without discarding week one.
    }
  };
  if (solving) {
    return <><h1>Week 2</h1><SolveStatus /></>;
  }
  if (solveError) {
    return <><h1>Week 2</h1><ErrorState retry={retry}>{solveError}</ErrorState></>;
  }
  if (!plan)
    return (
      <>
        <h1>Week 2</h1>
        <EmptyState
          action="Go to inputs"
          onAction={() => go('inputs')}
        >
          No plan yet. Plan week one to see your leftovers.
        </EmptyState>
      </>);
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">Make the next receipt smaller</span>
        <h1>Week 2</h1>
        <p>Leftovers from week 1 count as free groceries in week 2.</p>
      </div>
      <div className="week-layout">
        <div className="stack">
          {state.week === 1 ?
            <>
              <SimulateButton
                click={() => {
                  void simulate();
                }}
                busy={solving}
              />
              <LeftoverList items={nextWeekPantry(plan)} />
            </>
            :
            <>
              <WasteAvoided plan={plan} />
              <LeftoverList title={`Carried over from week ${state.week - 1}`} items={state.pantry} />
              {dropped.length > 0
                &&
                <LeftoverList items={dropped} title="Spoiled and dropped" spoiled />
              }
              {state.plus
                &&
                <SimulateButton
                  click={() => {
                    void simulate();
                  }}
                  busy={solving}
                />
              }
            </>
          }

        </div>
        <div className="stack">
          {state.week > 1 ?
            state.plus ?
              <><Paywall /><CheckoutGapCard plan={plan} budget={state.inputs!.budget} /></>
              :
              <Paywall />
            :
            <div className="card">
              <h2>Buy once. Use it next week.</h2>
              <p>
                The food left in your packages has value.
                Advance a week to see what your next basket can use.
              </p>
            </div>
          }
        </div>
      </div>
      {state.week > 1 && state.plus
        &&
        <BasketTable plan={plan} locked={locked} />
      }
    </>
  );
}
