import { useState } from 'react';
import { Button } from './Button';
export function TasteSummary({ liked, skipped, clear }: {
  liked: number;
  skipped: number;
  clear: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return <div className="taste-summary">
    <p>Your taste: {liked} liked, {skipped} skipped</p>
    {confirm ? <div><p>Clear all likes and skips?</p>
      <Button variant="danger" size="sm" onClick={() => {
        clear();
        setConfirm(false);
      }}>Clear</Button>
      <Button quiet size="sm" onClick={() => setConfirm(false)}>Keep</Button>
    </div> : <Button quiet size="sm" onClick={() => setConfirm(true)}>Reset</Button>}
  </div>;
}
