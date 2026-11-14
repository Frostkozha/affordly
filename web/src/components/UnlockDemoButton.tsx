import './Paywall.css';
import { useStore } from '../lib/store';
import { Button } from './Button';

export function UnlockDemoButton({ unlocked }: {
  unlocked?: () => void;
}) {
  const { setPlus } = useStore();
  return (
    <div>
      <Button
        primary
        onClick={() => {
          setPlus(true);
          unlocked?.();
        }}
      >
        Unlock demo
      </Button>
      <p className="meta">Demo unlock. No payment, nothing is charged.</p>
    </div>
  );
}
