import './AssistantDrawer.css';
import type { Recipe } from '@affordly/engine';
import { MealThumb } from './MealThumb';
import { fmtNum } from '../lib/fmtMoney';

export function RecipeCard({ recipe, open }: {
  recipe: Recipe;
  open: (r: Recipe) => void;
}) {
  return (
    <button
      className="recipe-card"
      onClick={() => open(recipe)}
    >
      <MealThumb recipe={recipe} />
      <span>
        <strong>{recipe.name}</strong>
        <span className="meta num">
          {recipe.cookMinutes}
          {' '}
          min ·
          {' '}
          {fmtNum(recipe.perServing.kcal)}
          {' '}
          kcal per serving ·
          {' '}
          {fmtNum(recipe.perServing.protein)}
          {' '}
          g protein per serving
        </span>
      </span>
    </button>
  );
}
