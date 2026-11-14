import { useEffect, useMemo, useRef, useState } from 'react';
import type { Inputs, Recipe } from '@affordly/engine';
import { getRecipes } from '../lib/engine';
import { useStore } from '../lib/store';
import { decide, readTaste, shuffleRecipes } from '../lib/taste';
import { useSwipe } from '../lib/useSwipe';
import { useToast } from '../lib/useToast';
import { MealCard } from './MealCard';
import { TasteSummary } from './TasteSummary';
import { GroceryBag } from './art/GroceryBag';
import { SwipeControls } from './SwipeControls';
import { DeckSkeleton } from './DeckSkeleton';
import { DeckEnd } from './DeckEnd';
type Decision = {
  id: string;
  liked: boolean;
  skipped: boolean
};
const sessionHistory: Decision[] = [];
// Likes are a preference, not a rule: say honestly how many made it into the week.
function rebuiltMessage(liked: string[], planned: string[]) {
  const used = liked.filter(id => planned.includes(id)).length;
  if (liked.length === 0 || used === liked.length)
    return 'Week rebuilt with your taste.';
  return `Week rebuilt. ${used} of ${liked.length} liked meals fit your limits this week.`;
}
export function SwipeDeck({ open }: {
  open: (recipe: Recipe) => void
}) {
  const { inputs, setInputs, run, solving, ready } = useStore();
  const { liked, skipped } = readTaste(inputs);
  const history = useRef(sessionHistory);
  const [canUndo, setCanUndo] = useState(() => sessionHistory.length > 0);
  const [announcement, announce] = useState('');
  const [error, setError] = useState('');
  const { notify } = useToast();
  const ordered = useMemo(() => shuffleRecipes(getRecipes()), []);
  const eligible = ordered.filter(r => r.cookMinutes <= inputs.maxCookMinutes
    && !r.contains.some(tag => inputs.avoid.includes(tag)));
  const pending = eligible.filter(r => !liked.includes(r.id) && !skipped.includes(r.id));
  const current = pending[0];
  const { element: cardRef, ...swipe } = useSwipe(like => {
    if (!current)
      return;
    history.current.push({ id: current.id, liked: liked.includes(current.id),
      skipped: skipped.includes(current.id) });
    setCanUndo(true);
    setInputs(decide(inputs, current.id, like));
    announce((like ? 'Liked ' : 'Skipped ') + current.name + '.');
  });
  const undo = () => {
    if (swipe.leaving)
      return;
    const previous = history.current.pop();
    setCanUndo(history.current.length > 0);
    if (!previous)
      return;
    const next: Inputs = {
      ...inputs,
      likedRecipeIds: liked.filter(id => id !== previous.id),
      excludedRecipeIds: skipped.filter(id => id !== previous.id)
    };
    if (previous.liked)
      next.likedRecipeIds!.push(previous.id);
    if (previous.skipped)
      next.excludedRecipeIds.push(previous.id);
    setInputs(next);
    announce('Decision undone.');
  };
  const clear = () => {
    setInputs({ ...inputs, likedRecipeIds: [], excludedRecipeIds: [] });
    history.current.length = 0;
    setCanUndo(false);
    notify('Taste cleared.');
  };
  const rebuild = async () => {
    setError('');
    try {
      const result = await run(inputs);
      if (result.ok)
        notify(rebuiltMessage(liked, result.plan.meals.map(meal => meal.recipeId)));
      location.hash = '/plan#plan';
    } catch {
      setError('Could not rebuild your week. Your taste is saved. Try again.');
    }
  };
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const target = document.activeElement;
      if (target instanceof HTMLElement && target !== document.body
        && !target.closest('.swipe-layout'))
        return;
      if (target instanceof HTMLElement && target.closest('button, a, input, textarea, select'))
        return;
      if (['ArrowLeft', 'ArrowRight', 'Backspace', 'z', 'Z'].includes(event.key))
        event.preventDefault();
      if (event.key === 'ArrowLeft' && current)
        swipe.commit(false);
      if (event.key === 'ArrowRight' && current)
        swipe.commit(true);
      if (['Backspace', 'z', 'Z'].includes(event.key))
        undo();
      if (event.key === 'Enter' && current
        && !(target instanceof HTMLElement && target.closest('.meal-card'))) {
        event.preventDefault();
        open(current);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  if (!ready)
    return <DeckSkeleton />;
  if (!eligible.length)
    return <div className="card deck-empty"><GroceryBag />
      <h2>No meals match your rules.</h2><p>Loosen your avoid list or cooking time.</p>
      <a className="btn" href="#/plan#inputs">Edit inputs</a></div>;
  return <div className="swipe-layout" tabIndex={-1}>
    <div className="discover-explainer">
      <p>Likes shape next week's plan. Skipped meals stay off it.</p>
      <TasteSummary liked={liked.length} skipped={skipped.length} clear={clear}
        rebuild={() => void rebuild()} busy={solving} />
      <p className="keys-hint meta">Keys: left arrow skips, right arrow likes, Z undoes.</p>
      {error && <p role="alert" className="error">{error}</p>}
    </div>
    <div className="deck-column">
      <p className="deck-progress num">{Math.min(eligible.length, eligible.length - pending.length + 1)}
        {' '}of {eligible.length}</p>
      <progress aria-label="Meals reviewed" value={eligible.length - pending.length} max={eligible.length} />
      {current ? <>
        <div className="swipe-stack">
          {pending.slice(1, 3).reverse().map((recipe, i, behind) =>
            <div key={recipe.id} className="behind-card" inert aria-hidden="true"
              style={{
                transform: 'translateY(' + (behind.length - i) * 8 + 'px) scale('
                  + (1 - (behind.length - i) * .04) + ')'
              }}>
              <MealCard recipe={recipe} top={false} open={() => { }} />
            </div>)}
          <div ref={cardRef} key={current.id}
            className={'swipe-top' + (announcement === 'Decision undone.' ? ' undo-return' : '')}
            {...swipe.handlers}>
            <MealCard key={current.id} recipe={current} top open={() => open(current)} />
            <span className={'stamp stamp-like' + (swipe.stamp === true ? ' committed' : '')}>ADDED</span>
            <span className={'stamp stamp-nope' + (swipe.stamp === false ? ' committed' : '')}>VOID</span>
          </div>
        </div>
        <SwipeControls busy={swipe.leaving} canUndo={canUndo}
          choose={swipe.commit} undo={undo} />
      </> : <DeckEnd liked={liked.length} skipped={skipped.length} busy={solving}
        rebuild={() => void rebuild()} clear={clear} undo={undo} canUndo={canUndo} />}
    </div>
    <span className="sr-only" aria-live="polite">{announcement}</span>
  </div>;
}
