import './PlanView.css';
import type { Recipe } from '@affordly/engine';
import { getCatalog } from '../lib/engine';
import { fmtNum } from '../lib/fmtMoney';
import { Overlay } from './Overlay';
import { MealThumb } from './MealThumb';

export function RecipeDialog({ recipe, servings = 1, close }: {
  recipe: Recipe;
  servings?: number;
  close: () => void;
}) {
  return (
    <Overlay
      title={recipe.name}
      onClose={close}
    >
      <div className="recipe-hero"><MealThumb recipe={recipe} /></div>
      <p>{recipe.description}</p>
      <p className="num">
        {recipe.cookMinutes}
        {' '}
        min ·
        {' '}
        {servings}
        {' '}
        serving
        {servings !== 1 ? 's' : ''}
      </p>
      <p className="num">
        Per serving:
        {' '}
        {fmtNum(recipe.perServing.kcal)}
        {' '}
        kcal ·
        {' '}
        {fmtNum(recipe.perServing.protein)}
        {' '}
        g protein
      </p>
      <p className="meta num">
        {fmtNum(recipe.perServing.carbs)}
        {' '}
        g carbs ·
        {' '}
        {fmtNum(recipe.perServing.fat)}
        {' '}
        g fat
      </p>
      <h3>Ingredients</h3>
      <ul className="ingredients">
        {recipe.ingredients.map(i =>
          <li key={i.productId}>
            <span>
              {getCatalog().products.find(p => p.id === i.productId)?.name}
            </span>
            <span className="num">{fmtNum(i.grams)}{' '}g</span>
          </li>
        )}
      </ul>
      <h3>Steps</h3>
      <ol>
        {recipe.steps.map(step =>
          <li key={step}>{step}</li>
        )}
      </ol>
      <p className="meta">
        Source:
        {' '}
        <a
          href={recipe.source.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {recipe.source.name}
          ,
          {' '}
          {recipe.source.license}
        </a>
      </p>
    </Overlay>
  );
}
