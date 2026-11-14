import { useState } from 'react';
import { GroceryBag } from './art/GroceryBag';
import { Button } from './Button';
export function DeckEnd({ liked, skipped, busy, rebuild, clear, undo, canUndo }: {
  liked: number;
  skipped: number;
  busy: boolean;
  rebuild: () => void;
  clear: () => void;
  undo: () => void;
  canUndo: boolean;
}) {
  const [confirm, setConfirm] = useState(false);
  return <div className="card deck-empty"><GroceryBag />
    <h2>You've seen every meal.</h2><p>You liked {liked} and skipped {skipped}.</p>
    <Button primary size="lg" busy={busy} onClick={rebuild}>Rebuild my week</Button>
    {confirm ? <div><p>Clear all likes and skips?</p>
      <Button variant="danger" size="sm" onClick={clear}>Clear</Button>
      <Button quiet size="sm" onClick={() => setConfirm(false)}>Keep</Button>
    </div> : <Button quiet onClick={() => setConfirm(true)}>Start over</Button>}
    <Button disabled={!canUndo} quiet onClick={undo}>Undo</Button>
  </div>;
}
