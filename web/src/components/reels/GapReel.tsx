import type { Plan } from '@affordly/engine';
import { fmtMoney } from '../../lib/fmtMoney';
export function GapReel({ plan, t }: {
  plan: Plan;
  t: number
}) {
  const ratio = plan.basketCost > 0 ? plan.gramCost / plan.basketCost : 1;
  return <div className="reel-number-content">
    <span className="eyebrow">THE CHECKOUT GAP</span>
    <p className="reel-timed" data-visible={t >= 1000}>Recipe price
      <span className="money"> {fmtMoney(plan.gramCost)}</span></p>
    <div className="gap-track"><div style={{
      width: ratio * 100 + '%',
      transform: 'scaleX(' + Math.max(0, Math.min(1, (t - 300) / 700)) + ')'
    }} /></div>
    <p className="reel-timed" data-visible={t >= 1700}>Receipt price
      <span className="money"> {fmtMoney(plan.basketCost)}</span></p>
    <div className="gap-track receipt-track"><div style={{
      transform:
        'scaleX(' + Math.max(0, Math.min(1, (t - 1000) / 700)) + ')'
    }} />
      {plan.checkoutGap > 0 && <i style={{
        left: ratio * 100 + '%', width: (1 - ratio) * 100 + '%',
        transform: 'scaleX(' + Math.max(0, Math.min(1, (t - 1800) / 600)) + ')'
      }} />}</div>
    <div className="reel-timed" data-visible={t >= 2600}>
      {plan.checkoutGap > 0 ? <><p className="money money--big money--over">+{fmtMoney(plan.checkoutGap)}</p>
        <p>You pay {fmtMoney(plan.checkoutGap)} for food you will not eat this week.</p></> :
        <p>No gap this week.</p>}
    </div>
    {plan.perishableLeftValue > 0 && <p className="reel-timed" data-visible={t >= 5600}>
      Week 2 can carry perishable leftovers worth {fmtMoney(plan.perishableLeftValue)}.</p>}
  </div>;
}
