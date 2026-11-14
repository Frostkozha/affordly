import './Paywall.css';
import { demoTerms } from '../lib/config';
import { Badge } from './Badge';
import { Money } from './Money';
import { UnlockDemoButton } from './UnlockDemoButton';

export function PlanCompare({ unlocked }: {
  unlocked?: () => void;
}) {
  return (
    <div className="compare">
      <article className="card plus-card">
        <Badge kind="plus">Best for repeat weeks</Badge>
        <h3>Plus</h3>
        <p className="plan-price"><Money value={demoTerms.monthly} />/month</p>
        <p>or{' '}<Money value={demoTerms.yearly} />/year</p>
        <p className="meta">
          Save
          {' '}
          <Money value={demoTerms.monthly * 12 - demoTerms.yearly} />
          {' '}
          vs monthly
        </p>
        <ul>
          {[
            'Week two onward with leftover carry-over',
            'History of every week',
            'Training-aware meals',
            'Unlimited swaps'
          ].map(t =>
            <li key={t}>{t}</li>
          )}
        </ul>
        <UnlockDemoButton unlocked={unlocked} />
      </article>
      <article className="card">
        <h3>Free</h3>
        <p className="plan-price"><Money value={0} /></p>
        <ul>
          {['Week one plan', 'Basket', 'Checkout Gap', '3 swaps'].map(t =>
            <li key={t}>{t}</li>
          )}
        </ul>
      </article>
    </div>
  );
}
