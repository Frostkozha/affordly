import { GroceryBag } from '../art/GroceryBag';
export function CreatorsReel({ t }: {
  t: number
}) {
  return <div className="reel-number-content"><GroceryBag draw />
    <h2>Make reels like this.</h2><h2 className="reel-timed" data-visible={t >= 800}>Get Plus free.</h2>
    <p className="reel-timed" data-visible={t >= 1400}>Post 4 real weeks a month. We cover Plus.</p>
    <div className="reel-timed" data-visible={t >= 2000}>
      <a className="btn btn--primary btn--lg" href="#/creators">See the Creators programme</a>
      <p className="meta">Early programme. Applications reviewed by hand.</p>
    </div>
  </div>;
}
