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
      <label htmlFor={`price-${productId}`}>Store price per package (editable)</label>
      <div className="inline">
        <span aria-hidden="true">$</span>
        <input
          id={`price-${productId}`}
          className="num"
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.]?[0-9]*"
          value={value}
          aria-invalid={error}
          onChange={e => {
            const text = e.target.value.replace(',', '.');
            const price = Number(text);
            setValue(text);
            if (text !== '' && Number.isFinite(price) && price >= 0)
              void update(price);
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
