import type { Plan } from '@affordly/engine';
import { fmtMoney } from '../../lib/fmtMoney';
import { useCountUp } from '../../lib/useCountUp';
export function ReceiptReel({ plan, t }: {
  plan: Plan;
  t: number
}) {
  const cents = Math.round(plan.basketCost * 100);
  const perMeal = Math.round(plan.basketCost / plan.meals.length * 100);
  const total = useCountUp(cents, 300, 1800, t);
  const meals = useCountUp(plan.meals.length, 2300, 700, t);
  const each = useCountUp(perMeal, 3000, 900, t);
  return <div className="reel-number-content">
    <span className="eyebrow">THIS WEEK'S RECEIPT</span>
    <p className="money money--big" aria-hidden="true">{fmtMoney(total / 100)}</p>
    <span className="sr-only">{fmtMoney(cents / 100)}</span>
    <p className="num" aria-hidden="true">{meals} meals</p>
    <span className="sr-only">{plan.meals.length} meals</span>
    <p className="money" aria-hidden="true">{fmtMoney(each / 100)} per meal</p>
    <span className="sr-only">{fmtMoney(perMeal / 100)} per meal</span>
  </div>;
}
