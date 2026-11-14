import type { Plan } from '@affordly/engine';
import { getCatalog } from '../../lib/engine';
import { fmtMoney } from '../../lib/fmtMoney';
export function LeftoversReel({ plan, t }: {
  plan: Plan;
  t: number
}) {
  const lines = plan.basket.filter(line => line.gramsFromPantry > 0).map(line => {
    const product = getCatalog().products.find(p => p.id === line.productId)!;
    return {
      name: product.name, grams: line.gramsFromPantry,
      cents: Math.round(line.gramsFromPantry * product.price / product.packageGrams * 100)
    };
  });
  const target = Math.round(plan.pantryUsedValue * 100);
  const total = lines.reduce((sum, line) => sum + line.cents, 0);
  if (total !== target && lines.length) {
    const last = lines[lines.length - 1];
    last.name = 'Other items';
    last.cents += target - total;
  }
  return <div className="reel-number-content">
    <span className="eyebrow">LEFTOVERS SAVED</span><h2>Waste avoided</h2>
    <p className="money money--big money--save reel-timed" data-visible={t >= 300}>
      {fmtMoney(plan.pantryUsedValue)}</p>
    {lines.map((line, i) => <div className="receipt-row reel-timed" key={i}
      data-visible={t >= 1200 + i * 600}><span>{line.name}<small>{line.grams} g</small></span>
      <span className="money">{fmtMoney(line.cents / 100)}</span></div>)}
    <p className="reel-timed" data-visible={t >= 5000}>
      Leftovers from week 1, used in week 2, valued at store price.</p>
  </div>;
}
