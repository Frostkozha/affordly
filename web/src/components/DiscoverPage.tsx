import { DiscoverBoundary } from './DiscoverBoundary';
import { ReelFeed } from './ReelFeed';
import type { Recipe } from '@affordly/engine';
import { SwipeDeck } from './SwipeDeck';
import './Discover.css';
export function DiscoverPage({ reels, open }: {
  reels: boolean;
  open: (recipe: Recipe) => void
}) {
  return <section className="discover-page">
    <div className="discover-header"><h1>Discover</h1>
      <nav className="sub-tabs" aria-label="Discover sections">
        <a href="#/discover" aria-current={!reels ? 'page' : undefined}>Swipe</a>
        <a href="#/discover/reels" aria-current={reels ? 'page' : undefined}>Reels</a>
      </nav></div>
    {reels ? <ReelFeed open={open} /> : <DiscoverBoundary><SwipeDeck open={open} /></DiscoverBoundary>}
  </section>;
}
