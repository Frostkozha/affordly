import './WeekTwo.css';
import type { PantryItem } from '@affordly/engine';
import { getCatalog } from '../lib/engine';
import { fmtNum } from '../lib/fmtMoney';
import { Money } from './Money';

export function LeftoverList({ items, title = 'Pantry preview', spoiled = false }: {
  items: PantryItem[];
  title?: string;
  spoiled?: boolean;
}) {
  return (
    <section>
      <h2>{title}</h2>
      {!items.length ?
        <p>
          {spoiled ?
            'No leftovers spoiled.' :
            'Nothing left over this week. Next week starts from zero.'}
        </p>
        :
        <ul className="leftover-list">
          {items.map((item, i) => {
            const p = getCatalog().products.find(p => p.id === item.productId)!;
            return (
              <li
                key={`${item.productId}-${i}`}
                className="receipt-row"
              >
                <span className="leftover-name">
                  {p.name}
                  <span className="meta">
                    {spoiled ? 'past its keeping time' :
                      item.daysLeft === null ? 'shelf stable' : `keeps ${item.daysLeft} more days`}
                  </span>
                </span>
                <span className="leftover-amount num">
                  {fmtNum(item.grams)}
                  {' '}
                  g
                  {spoiled
                    &&
                    <span className="error"><Money value={item.grams / p.packageGrams * p.price} /></span>
                  }
                </span>
              </li>
            );
          })}
        </ul>
      }
    </section>
  );
}
