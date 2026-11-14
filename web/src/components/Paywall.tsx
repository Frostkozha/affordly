import './Paywall.css';
import { useStore } from '../lib/store';
import { PlanCompare } from './PlanCompare';
import { Icon } from './art/Icons';
export function Paywall({ message, unlocked }: {
  message?: string;
  unlocked?: () => void
}) {
  const { state } = useStore();
  if (state.plus)
    return <p className="card plus-on" role="status">
      <Icon name="check" size={20} />Plus is on (demo).</p>;
  return <section className="paywall">
    <h2>Plus keeps the savings going</h2>
    {message && <p>{message}</p>}
    <PlanCompare unlocked={unlocked} />
    <p className="meta">Sign-in and payment arrive in v2.</p>
  </section>;
}
