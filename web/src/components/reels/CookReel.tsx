import { useState } from 'react';
import type { Recipe } from '@affordly/engine';
import { Button } from '../Button';
export function CookReel({ recipe, t, reduced, liked, like, open }: {
  recipe: Recipe;
  t: number;
  reduced: boolean;
  liked: boolean;
  like: () => void;
  open: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const steps = recipe.steps.length > 5 ? [...recipe.steps.slice(0, 4),
  '+ ' + (recipe.steps.length - 4) + ' more steps in the recipe'] : recipe.steps;
  const slot = Math.max(1200, 6800 / Math.max(1, steps.length));
  const index = Math.floor((t - 1200) / slot);
  return <div className={'cook-reel' + (reduced ? ' static' : '') + (failed ? ' photo-failed' : '')}>
    {failed ? <span className="meal-initial">{recipe.name[0]}</span> :
      <img src={import.meta.env.BASE_URL + recipe.photo.slice(1)} alt={recipe.name}
        onError={() => setFailed(true)} />}
    <div className="cook-copy"><span className="badge">COOK IT</span><h2>{recipe.name}</h2>
      {reduced ? <ol>{steps.map((step, i) => <li key={i}>{step}</li>)}</ol> :
        t >= 1200 && t < 8000 && <p className="cook-step" key={index}>{steps[index]}</p>}
      {(reduced || t >= 8000) && <div className="cook-end">
        <p className="num">{recipe.cookMinutes} min · {recipe.perServing.protein} g protein</p>
        <Button size="sm" aria-pressed={liked} onClick={like}>{liked ? 'Liked' : 'More of this'}</Button>
        <Button primary size="sm" onClick={open}>Open recipe</Button>
      </div>}
    </div>
  </div>;
}
