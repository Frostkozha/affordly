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

export function PlanView({ plan, go, open }: {
  plan: Plan | null;
  go: (tab: string) => void;
  open: (recipe: Recipe, servings?: number) => void;
}) {
  const { inputs } = useStore();
  if (!plan)
    return (
      <EmptyState
        action="Go to inputs"
        onAction={() => go('inputs')}
      >
        No plan yet. Set your budget and plan the week.
      </EmptyState>);
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
        <Badge
          kind={plan.basketCost <= inputs.budget ?
            'save' :
            'over'}
        >
          {plan.basketCost <= inputs.budget ?
            'Fits' :
            'Over budget'}
        </Badge>
        <progress
          aria-label="Budget used"
          value={Math.min(plan.basketCost, inputs.budget)}
          max={inputs.budget}
        />
      </div>
      <div className="plan-layout">
        <div className="day-grid">
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
