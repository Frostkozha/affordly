import './PlanView.css';
import { useState } from 'react';
import type { Recipe } from '@affordly/engine';

export function MealThumb({ recipe }: {
  recipe: Recipe;
}) {
  const [failed, setFailed] = useState(false);
  return failed ?
    <span
      className="meal-thumb placeholder"
      role="img"
      aria-label={recipe.name}
    >
      {recipe.name[0]}
    </span>
    :
    <img
      className="meal-thumb"
      src={import.meta.env.BASE_URL + recipe.photo.slice(1)}
      alt={recipe.name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
    ;
}
