import './CheckoutGapCard.css';
import './BasketTable.css';
import type { Plan } from '@affordly/engine';
import { Money } from './Money';

export function BasketTotal({ plan }: {
  plan: Plan;
}) {
  return (
    <div
      className="basket-total"
      aria-live="polite"
    >
      <strong>Receipt total</strong>
      <Money value={plan.basketCost} />
    </div>
  );
}
