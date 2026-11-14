import { Money } from './Money';
import './WeekTwo.css';
import type { Plan } from '@affordly/engine';

export function WasteAvoided({ plan, week }: {
  plan: Plan;
  week: number;
}) {
  return (
    <div
      className="card waste"
      aria-live="polite"
    >
      <span className="eyebrow">Waste avoided</span>
      <Money value={plan.pantryUsedValue} big save />
      <p>Leftovers from week {week - 1} used in week {week}, valued at store price.</p>
    </div>
  );
}
