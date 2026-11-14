import { Money } from './Money';
import './WeekTwo.css';
import type { Plan } from '@affordly/engine';

export function WasteAvoided({ plan }: {
  plan: Plan;
}) {
  return (
    <div
      className="card waste"
      aria-live="polite"
    >
      <span className="eyebrow">Waste avoided</span>
      <Money value={plan.pantryUsedValue} big save />
      <p>Leftovers from week 1 used in week 2, valued at store price.</p>
    </div>
  );
}
