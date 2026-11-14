import './CheckoutGapCard.css';
import './BasketTable.css';
import { useState } from 'react';
import { Button } from './Button';

export function SwapButton({ productId, swap }: {
  productId: string;
  swap: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void swap(productId).catch(() => { }).finally(() => setBusy(false));
      }}
    >
      {busy ? 'Swapping...' : 'Swap'}
    </Button>
  );
}
