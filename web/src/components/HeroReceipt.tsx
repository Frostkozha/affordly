import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import type { Plan } from '@affordly/engine';
import { getCatalog } from '../lib/engine';
import { fmtMoney } from '../lib/fmtMoney';
import { Perforation } from './art/Perforation';
let printed = false;
export function HeroReceipt({ plan }: {
  plan: Plan
}) {
  const [print] = useState(!printed);
  useEffect(() => {
    printed = true;
  }, []);
  const products = getCatalog().products;
  const lines = [...plan.basket].sort((a, b) => b.cost - a.cost);
  return <div className="hero-receipt">
    <section className={'card proof tear-bottom' + (print ? ' print-in' : '')}>
      <div className="receipt-heading num"><span>AFFORDLY</span><span>SAMPLE WEEK</span></div>
      <Perforation />
      {lines.slice(0, 5).map((line, i) => {
        const product = products.find(p => p.id === line.productId)!;
        return <div className="receipt-row" key={line.productId} style={{ '--i': i } as CSSProperties}>
          <div>{product.name}<small>{line.packages} x {product.packageLabel}</small></div>
          <span className="money">{fmtMoney(line.cost)}</span>
        </div>;
      })}
      {lines.length > 5 && <p className="meta">+ {lines.length - 5} more items</p>}
      <div className="proof-figure"><span>Recipe price</span>
        <span className="money">{fmtMoney(plan.gramCost)}</span></div>
      <div className="proof-figure"><span>Receipt price</span>
        <span className="money">{fmtMoney(plan.basketCost)}</span></div>
      <div className="proof-gap"><span>Checkout Gap</span>
        <span className="money">+{fmtMoney(plan.checkoutGap)}</span></div>
      <svg className="receipt-end" width="140" height="28" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => <rect key={i} x={i * 5} y="0"
          width={i % 3 ? 1 : 2} height="28" fill="currentColor" />)}
      </svg>
      {print && <span className="print-head" aria-hidden="true" />}
    </section>
    <p className="meta">Same week, same food. The {fmtMoney(plan.checkoutGap)} gap is packages
      you cannot half-buy.</p>
  </div>;
}
