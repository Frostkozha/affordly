import { Icon } from './art/Icons';
import { useState } from 'react';
import type { Plan, Recipe } from '@affordly/engine';
import type { ReelData } from '../lib/reelData';
import { useReelClock } from '../lib/useReelClock';
import { useReducedMotion } from '../lib/useReducedMotion';
import { useStore } from '../lib/store';
import { decide } from '../lib/taste';
import { fmtMoney } from '../lib/fmtMoney';
import { ReceiptReel } from './reels/ReceiptReel';
import { BasketReel } from './reels/BasketReel';
import { GapReel } from './reels/GapReel';
import { LeftoversReel } from './reels/LeftoversReel';
import { CookReel } from './reels/CookReel';
import { CreatorsReel } from './reels/CreatorsReel';
import { ReelRail } from './ReelRail';
import { Button } from './Button';
export function Reel({ data, plan, active, sample, index, total, navigate, open, notify }: {
  data: ReelData;
  plan: Plan;
  active: boolean;
  sample: boolean;
  index: number;
  total: number;
  navigate: (index: number) => void;
  open: (recipe: Recipe) => void;
  notify: (message: string) => void;
}) {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const { inputs, setInputs } = useStore();
  const clock = useReelClock(data.duration, active && !paused && !reduced, data.kind !== 'creators');
  const t = active && !paused && !reduced ? clock.t : Infinity;
  const fade = !active || paused || reduced ? 1 : Math.min(1, clock.t / 240);
  const receiptFade = data.kind === 'receipt' && active && !paused && !reduced ?
    Math.max(0, Math.min(1, (data.duration - clock.t) / 400)) : 1;
  const recipe = data.recipe;
  const liked = Boolean(recipe && inputs.likedRecipeIds?.includes(recipe.id));
  const like = () => {
    if (!recipe)
      return;
    setInputs(liked ? { ...inputs, likedRecipeIds: inputs.likedRecipeIds?.filter(id => id !== recipe.id) } :
      decide(inputs, recipe.id, true));
  };
  const openReel = () => {
    if (recipe)
      open(recipe);
    else
      location.hash = data.kind === 'creators' ? '/creators' :
        data.kind === 'leftovers' ? '/next-week' : '/plan/basket';
  };
  const share = async () => {
    const facts = recipe ? recipe.name + ': ' + recipe.cookMinutes + ' min, '
      + recipe.perServing.protein + ' g protein.' :
      data.kind === 'creators' ? 'Make reels like this. Get Plus free with Affordly.' :
        data.kind === 'gap' ? 'My Checkout Gap: +' + fmtMoney(plan.checkoutGap) + '.' :
          data.kind === 'leftovers' ? 'My leftovers saved ' + fmtMoney(plan.pantryUsedValue) + '.' :
            'My week on Affordly: ' + plan.meals.length + ' meals for ' + fmtMoney(plan.basketCost)
            + ' at the register.';
    const text = facts + ' Plan yours: https://affordly.pages.dev';
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError')
        return;
    }
    try {
      await navigator.clipboard.writeText(text);
      notify('Copied.');
    } catch {
      notify('Could not copy. Link: https://affordly.pages.dev');
    }
  };
  return <article className={'reel' + (data.kind === 'cook' ? ' reel-photo' : '')}
    data-index={index} aria-label={data.title} onClick={event => {
      if (!(event.target as HTMLElement).closest('button, a'))
        setPaused(value => !value);
    }}>
    {reduced ? <p className="reel-position num">{index + 1} of {total}</p> :
      <div className="reel-progress" aria-hidden="true"><div style={{
        transform:
          'scaleX(' + (active ? clock.p : 1) + ')'
      }} /></div>}
    <div className="reel-label"><span className="badge">{sample ? 'Made from a sample plan' :
      'Made from your plan'}</span>{sample && data.kind !== 'creators' &&
        <span className="badge">Sample week</span>}</div>
    <button className="sr-only" aria-label={paused ? 'Play' : 'Pause'} aria-pressed={paused}
      onClick={() => setPaused(value => !value)}>{paused ? 'Play' : 'Pause'}</button>
    <div className="reel-content" style={{ opacity: fade * receiptFade }}>
      {data.kind === 'receipt' && <ReceiptReel plan={plan} />}
      {data.kind === 'basket' && <BasketReel plan={plan} t={t} />}
      {data.kind === 'gap' && <GapReel plan={plan} t={t} />}
      {data.kind === 'leftovers' && <LeftoversReel plan={plan} t={t} />}
      {recipe && <CookReel recipe={recipe} t={t} reduced={reduced || !active || paused}
        liked={liked} like={like} open={() => open(recipe)} />}
      {data.kind === 'creators' && <CreatorsReel t={t} />}
    </div>
    {paused && !reduced && <span className="pause-mark" aria-hidden="true">
      <Icon name="pause" size={28} /></span>}
    <ReelRail recipe={Boolean(recipe)} liked={liked} like={like} sample={sample}
      share={() => void share()} open={openReel} />
    {reduced && <div className="reel-navigation">
      <Button size="sm" disabled={index === 0} onClick={() => navigate(index - 1)}>Back</Button>
      <Button size="sm" disabled={index === total - 1} onClick={() => navigate(index + 1)}>Next</Button>
    </div>}
  </article>;
}
