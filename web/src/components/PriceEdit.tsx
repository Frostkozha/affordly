import './CheckoutGapCard.css';
import './BasketTable.css';
import { useState } from 'react';
import { getCatalog, setPrice, originalPrices } from '../lib/engine';
import { fmtMoney } from '../lib/fmtMoney';
import { Button } from './Button';
import { ErrorState } from './ErrorState';

export function PriceEdit({ productId, changed }: {
  productId: string;
  changed: () => Promise<void>;
}) {
  const product = getCatalog().products.find(p => p.id === productId)!;
  const [value, setValue] = useState(String(product.price));
  const [error, setError] = useState(false);
  const update = async (price: number) => {
    try {
      setPrice(productId, price);
      await changed();
      setError(false);
    } catch {
      setError(true);
    }
  };
  return (
    <div className="price-edit">
      <label htmlFor={`price-${productId}`}>Price per package</label>
      <div className="inline">
        <span aria-hidden="true">$</span>
        <input
          id={`price-${productId}`}
          className="num"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={value}
          aria-invalid={error}
          onChange={e => {
            setValue(e.target.value);
            if (e.target.value !== '')
              void update(e.target.valueAsNumber);
            else
              setError(true);
          }}
        />
      </div>
      {product.price !== originalPrices[productId]
        &&
        <small>
          Price changed from
          {' '}
          {fmtMoney(originalPrices[productId])}
          .
          {' '}
          <Button
            quiet
            onClick={() => {
              setValue(String(originalPrices[productId]));
              void update(originalPrices[productId]);
            }}
          >
            Reset
          </Button>
        </small>
      }
      {error
        &&
        <ErrorState
          retry={() => {
            setValue(String(product.price));
            void update(product.price);
          }}
        >
          Could not update price. Kept
          {' '}
          {fmtMoney(product.price)}
          .
        </ErrorState>
      }
    </div>
  );
}
