import { Icon } from './art/Icons';
export function ReelRail({ recipe, liked, like, sample, share, open }: {
  recipe: boolean;
  liked: boolean;
  like: () => void;
  sample: boolean;
  share: () => void;
  open: () => void;
}) {
  return <div className="reel-rail">
    {recipe && <div><button className="btn-round" aria-label={liked ? 'Liked' : 'More of this'}
      aria-pressed={liked} onClick={like}><Icon name="heart" /></button>
      <span>{liked ? 'Liked' : 'More of this'}</span></div>}
    {!sample && <div><button className="btn-round" aria-label="Share" onClick={share}>
      <Icon name="share" /></button><span>Share</span></div>}
    <div><button className="btn-round" aria-label="Open" onClick={open}><Icon name="open" /></button>
      <span>Open</span></div>
  </div>;
}
