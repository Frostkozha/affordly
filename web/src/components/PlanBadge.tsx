import './AccountPage.css';
import { Badge } from './Badge';

export function PlanBadge({ plus }: {
  plus: boolean;
}) {
  return (
    <div className="plan-badge">
      <span>Plan</span>
      <Badge kind={plus ? 'plus' : ''}>{plus ? 'Plus' : 'Free'}</Badge>
    </div>
  );
}
