import { Icon } from './art/Icons';
export function SwipeControls({ busy, canUndo, choose, undo }: {
  busy: boolean;
  canUndo: boolean;
  choose: (like: boolean) => void;
  undo: () => void;
}) {
  return <div className="swipe-controls">
    <div><button className="btn-round btn-round--over" aria-label="Not for me"
      disabled={busy} onClick={() => choose(false)}><Icon name="close" size={24} /></button>
      <span>Not for me</span></div>
    <div><button className="btn-round" aria-label="Undo" disabled={!canUndo || busy}
      onClick={undo}><Icon name="undo" /></button><span>Undo</span></div>
    <div><button className="btn-round btn-round--save" aria-label="More of this"
      disabled={busy} onClick={() => choose(true)}><Icon name="heart" size={24} /></button>
      <span>More of this</span></div>
  </div>;
}
