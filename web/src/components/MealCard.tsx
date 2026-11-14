import { useState } from 'react';
import type { Recipe } from '@affordly/engine';
import { fmtMoney } from '../lib/fmtMoney';
import { recipePrice } from '../lib/recipePrice';
import { Button } from './Button';
export function MealCard({ recipe, top, open }: {
  recipe: Recipe;
  top: boolean;
  open: () => void
}) {
  const [failed, setFailed] = useState(false);
  const tags = ['dairy', 'egg', 'gluten', 'nuts', 'soy', 'pork', 'fish']
    .filter(tag => !recipe.contains.includes(tag)).map(tag => tag === 'pork' || tag === 'fish' ?
      'No ' + tag : (tag === 'nuts' ? 'Nut' : tag[0].toUpperCase() + tag.slice(1)) + '-free');
  return <article className={'meal-card' + (failed ? ' photo-failed' : '')}
    tabIndex={top ? 0 : -1} aria-roledescription="meal card" aria-label={recipe.name}
    onKeyDown={event => {
      if (event.key === 'Enter' && event.target === event.currentTarget)
        open();
    }}>
    {failed ? <span className="meal-initial">{recipe.name[0]}</span> :
      <img src={import.meta.env.BASE_URL + recipe.photo.slice(1)} alt={recipe.name}
        draggable="false" onError={() => setFailed(true)} />}
    {top && <Button size="sm" className="meal-details" onClick={open}>Details</Button>}
    <div className="meal-caption">
      <h2>{recipe.name}</h2>
      <p className="num">{recipe.cookMinutes} min · {Math.round(recipe.perServing.protein)} g protein per serving</p>
      <p className="money">{fmtMoney(recipePrice(recipe))} per serving</p>
      {top && <p className="weight-note">By weight. The receipt rounds up to whole packages.</p>}
      <div className="meal-tags">{[...recipe.mealTypes.map(t => t[0].toUpperCase() + t.slice(1)),
      ...tags].slice(0, 4).map(tag => <span key={tag}>{tag}</span>)}</div>
    </div>
  </article>;
}
