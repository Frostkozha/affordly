import { fmtMoney } from '../lib/fmtMoney';
import { Icon } from './art/Icons';
export function FitsBanner({ budget, cost }: {
  budget: number;
  cost: number
}) {
  if (cost > budget)
    return null;
  return <span className="fits-banner"><span className="badge badge--save">
    <Icon name="check" size={16} /> Fits</span>
    <span>Fits your budget. {fmtMoney(budget - cost)} left.</span>
  </span>;
}
