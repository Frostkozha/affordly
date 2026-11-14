import './CheckoutGapCard.css';
import './BasketTable.css';
import type { BasketLine as BasketLineType } from '@affordly/engine';
import { getCatalog } from '../lib/engine';
import { fmtNum } from '../lib/fmtMoney';
import { Money } from './Money';
import { PriceEdit } from './PriceEdit';
import { SwapButton } from './SwapButton';

export function BasketLine({ line, changed, swap }: {
  line: BasketLineType;
  changed: () => Promise<void>;
  swap: (id: string) => Promise<void>;
}) {
  const p = getCatalog().products.find(p => p.id === line.productId)!;
  return (
    <tr>
      <th scope="row">
        <strong>{p.name}</strong>
        <span className="meta mobile-only num">{line.packages}{' '}×{' '}{p.packageLabel}</span>
        {line.gramsFromPantry > 0
          &&
          <span className="covered num">
            Covered by leftovers:
            {' '}
            {fmtNum(line.gramsFromPantry)}
            {' '}
            g
          </span>
        }
      </th>
      <td className="packages num">{line.packages}{' '}×{' '}{p.packageLabel}</td>
      <td className="num line-cost"><Money value={line.cost} /></td>
      <td
        className={`num line-left ${p.perishableDays !== null && line.gramsLeft > p.packageGrams / 2 ?
          'error' :
          ''}`}
      >
        <span className="mobile-only">Left{' '}</span>
        {fmtNum(line.gramsLeft)}
        {' '}
        g
      </td>
      <td className="line-actions">
        <PriceEdit productId={p.id} changed={changed} />
        <SwapButton productId={p.id} swap={swap} />
      </td>
    </tr>
  );
}
