import { getCatalog } from '../lib/engine';
import { Icon } from './art/Icons';
export function PriceBadge() {
  const catalog = getCatalog();
  const date = new Date(catalog.pricedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
  return <p className="price-badge"><Icon name="pin" size={14} />
    {catalog.priceSource === 'demo' ? 'Demo prices, not live store data' :
      'Prices: ' + catalog.store.name + ', updated ' + date}
  </p>;
}
