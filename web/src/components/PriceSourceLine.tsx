import { getCatalog } from '../lib/engine';

export function PriceSourceLine() {
  const catalog = getCatalog();
  const date = new Date(catalog.pricedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return (
    <p className="meta">
      {catalog.priceSource === 'kroger'
        ?
        `Prices: ${catalog.store.name}, updated ${date}`
        :
        `Estimated demo prices, ${date}`}
    </p>
  );
}
