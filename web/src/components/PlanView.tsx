import { useState } from 'react';
import { FitsBanner } from './FitsBanner';
import './PlanView.css';
import type { Plan, Recipe } from '@affordly/engine';
import { useStore } from '../lib/store';
import { Badge } from './Badge';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { Money } from './Money';
import { dayNames } from '../lib/config';
import { CheckoutGapCard } from './CheckoutGapCard';
import { DayCard } from './DayCard';
import { DayRings } from './DayRings';
import { isEaten } from '../lib/eaten';

export function PlanView({ plan, go, open }: {
  plan: Plan | null;
  go: (tab: string) => void;
  open: (recipe: Recipe, servings?: number) => void;
}) {
  const { inputs, revealPlan, state } = useStore();
  const [reveal] = useState(() => {
    if (!plan || !revealPlan) return false;
    const key = 'daysRevealed:' + plan.meals.map(meal => meal.recipeId + meal.servings).join(',');
    try {
      if (sessionStorage.getItem(key)) return false;
      sessionStorage.setItem(key, '1');
    } catch { /* Show the reveal for this mount when storage is unavailable. */ }
    return true;
  });
  if (!plan)
    return (
      <EmptyState
        action="Go to inputs"
        onAction={() => go('inputs')}
      >
        No plan yet. Set your budget and plan the week.
      </EmptyState>);
  const eatenTotal = plan.meals.filter(meal => isEaten(state.eaten, state.week, meal)).length;
  return (
    <>
      <div
        className="week-strip"
        aria-live="polite"
      >
        <div>
          <span className="eyebrow">Your week, priced by the package</span>
          <h2>
            Receipt total
            {' '}
            <Money value={plan.basketCost} />
            <span className="meta">of{' '}<Money value={inputs.budget} />{' '}budget</span>
          </h2>
        </div>
        {plan.basketCost > inputs.budget && <Badge kind="over">Over budget</Badge>}
        <FitsBanner budget={inputs.budget} cost={plan.basketCost} />
        <progress
          aria-label="Budget used"
          value={Math.min(plan.basketCost, inputs.budget)}
          max={inputs.budget}
        />
        <p className="meta num week-eaten">{eatenTotal} of {plan.meals.length} meals eaten</p>
      </div>
      <DayRings plan={plan} />
      <div className="plan-layout">
        <div className={'day-grid' + (reveal ? ' reveal-stagger' : '')}>
          {dayNames.map((name, day) =>
            <DayCard key={name} plan={plan} day={day} open={open} />
          )}
        </div>
        <aside className="plan-aside">
          <CheckoutGapCard plan={plan} budget={inputs.budget} />
          <Button onClick={() => go('basket')}>
            See the whole basket
          </Button>
        </aside>
      </div>
    </>
  );
}
