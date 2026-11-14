import './CheckoutGapCard.css';
import './BasketTable.css';
import type { Plan } from '@affordly/engine';
import { getCatalog } from '../lib/engine';
import { useStore } from '../lib/store';
import { fmtNum } from '../lib/fmtMoney';
import { Money } from './Money';

export function LeftoverTop3({ plan }: {
  plan: Plan;
}) {
  const { state: { week } } = useStore();
  return (
    <div>
      <h3>Where the gap comes from</h3>
      {[...plan.basket]
        .sort((a, b) => (b.cost - b.gramCost) - (a.cost - a.gramCost)).slice(0, 3).map(line => {
          const product = getCatalog().products.find(p => p.id === line.productId)!;
          return (
            <div
              className="receipt-row leftover-row"
              key={line.productId}
            >
              <div>
                <strong>{product.name}</strong>
                <span className="meta num">{line.packages}{' '}×{' '}{product.packageLabel}</span>
              </div>
              <div>
                <span className="num">{fmtNum(line.gramsLeft)}{' '}g left</span>
                <span className="meta"><Money value={line.cost - line.gramCost} />{' '}unused</span>
              </div>
            </div>
          );
        })}
      <p className="meta">
        Perishable leftovers worth
        {' '}
        <Money value={plan.perishableLeftValue} />
        {' '}
        may spoil. Week {week + 1} can carry them over.
      </p>
    </div>
  );
}
