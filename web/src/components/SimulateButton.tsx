import './WeekTwo.css';
import { Badge } from './Badge';
import { Button } from './Button';

export function SimulateButton({ click, busy }: {
  click: () => void;
  busy: boolean;
}) {
  return (
    <div>
      <div className="inline">
        <Button
          primary
          onClick={click}
          disabled={busy}
        >
          {busy ? 'Pricing your basket...' : 'Simulate next week'}
        </Button>
        <Badge>Demo</Badge>
      </div>
      <p className="meta">Demo time skip: advances 7 days, no real waiting.</p>
    </div>
  );
}
