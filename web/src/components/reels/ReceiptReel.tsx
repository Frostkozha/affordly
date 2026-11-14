import type { Plan } from '@affordly/engine';
import { fmtMoney } from '../../lib/fmtMoney';
// Money never animates: every figure shows its final value at once.
export function ReceiptReel({ plan }: {
  plan: Plan;
}) {
  const perMeal = plan.basketCost / plan.meals.length;
  return <div className="reel-number-content">
    <span className="eyebrow">THIS WEEK'S RECEIPT</span>
    <p className="money money--big">{fmtMoney(plan.basketCost)}</p>
    <p className="num">{plan.meals.length} meals</p>
    <p className="money">{fmtMoney(perMeal)} per meal</p>
  </div>;
}
