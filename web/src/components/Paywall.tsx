import './Paywall.css';
import { useStore } from '../lib/store';
import { Badge } from './Badge';
import { PlanCompare } from './PlanCompare';

export function Paywall({ message, unlocked }: {
  message?: string;
  unlocked?: () => void;
}) {
  const { state } = useStore();
  return state.plus ?
    <p className="card"><Badge kind="plus">Plus</Badge>{' '}Plus is on (demo).</p>
    :
    <section className="paywall">
      <h2>Plus keeps the savings going</h2>
      {message &&
        <p>{message}</p>
      }
      <PlanCompare unlocked={unlocked} />
      <p className="meta">Sign-in and payment arrive in v2.</p>
    </section>
    ;
}
