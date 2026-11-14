import './CheckoutGapCard.css';
import './BasketTable.css';
import type { Plan } from '@affordly/engine';
import { fmtMoney } from '../lib/fmtMoney';
import { Badge } from './Badge';
import { Money } from './Money';
import { LeftoverTop3 } from './LeftoverTop3';

export function CheckoutGapCard({ plan, budget }: {
  plan: Plan;
  budget: number;
}) {
  return (
    <section
      className="card checkout"
      aria-live="polite"
    >
      <div className="section-top">
        <h2>Checkout Gap</h2>
        <span className="eyebrow">The real receipt</span>
      </div>
      <div className="price-pair">
        <div>
          <p>Recipe price</p>
          <Money value={plan.gramCost} big />
          <p className="meta">What a recipe calculator says: grams used.</p>
        </div>
        <div>
          <p>Receipt price</p>
          <Money value={plan.basketCost} big />
          <p className="meta">What the register charges: whole packages.</p>
        </div>
      </div>
      <div
        className={`gap ${plan.checkoutGap > 0 ? 'has-gap' : ''}`}
      >
        <div className="section-top">
          <strong>Checkout Gap</strong>
          <Money value={plan.checkoutGap} gap big />
        </div>
        <p>
          {plan.checkoutGap > 0 ?
            <>
              You pay
              {' '}
              <Money value={plan.checkoutGap} />
              {' '}
              more than the recipes use.
              {' '}
              <Money value={plan.perishableLeftValue} />
              {' '}
              of that is perishable and may spoil.
            </>
            :
            'No gap this week.'}
        </p>
      </div>
      <LeftoverTop3 plan={plan} />
      <div className="receipt-row">
        <span>
          Receipt
          {' '}
          <Money value={plan.basketCost} />
          {' '}
          of
          {' '}
          <Money value={budget} />
          {' '}
          budget
        </span>
        <Badge
          kind={plan.basketCost <= budget ?
            'save' :
            'over'}
        >
          {plan.basketCost <= budget ?
            'Fits' :
            `Over by ${fmtMoney(plan.basketCost - budget)}`}
        </Badge>
      </div>
    </section>
  );
}
