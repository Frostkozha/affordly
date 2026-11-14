import { useState } from 'react';
import './Paywall.css';
import { useStore } from '../lib/store';
import { Button } from './Button';

export function UnlockDemoButton({ unlocked }: {
  unlocked?: () => void;
}) {
  const { setPlus } = useStore();
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <Button
        primary
        size="lg"
        block
        busy={busy}
        onClick={() => {
          setBusy(true);
          void setPlus(true).then(() => unlocked?.()).finally(() => setBusy(false));
        }}
      >
        Unlock demo
      </Button>
      <p className="meta">Demo unlock. No payment, nothing is charged.</p>
    </div>
  );
}
