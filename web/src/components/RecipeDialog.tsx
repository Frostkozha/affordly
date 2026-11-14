import './PlanView.css';
import type { Recipe } from '@affordly/engine';
import { getCatalog } from '../lib/engine';
import { fmtNum } from '../lib/fmtMoney';
import { Overlay } from './Overlay';
import { MealThumb } from './MealThumb';
import { Button } from './Button';

// `servings` is the planned portion (servings eaten at a meal). Leave it out when no meal is planned.
export function RecipeDialog({ recipe, servings, close }: {
  recipe: Recipe;
  servings?: number;
  close: () => void;
}) {
  const one = recipe.perServing;
  return (
    <Overlay
      title={recipe.name}
      onClose={close}
    >
      <div className="recipe-hero"><MealThumb recipe={recipe} /></div>
      <p>{recipe.description}</p>
      <p className="num">{recipe.cookMinutes} min</p>
      {servings !== undefined &&
        <p className="num">
          <strong>
            Your portion: {servings} serving{servings !== 1 ? 's' : ''} · {fmtNum(one.kcal * servings)} kcal
            · {fmtNum(one.protein * servings)} g protein
          </strong>
        </p>
      }
      <p className="meta num">
        One serving: {fmtNum(one.kcal)} kcal · {fmtNum(one.protein)} g protein · {fmtNum(one.carbs)} g carbs
        · {fmtNum(one.fat)} g fat
      </p>
      <h3>Ingredients for the full recipe (makes {recipe.servings} servings)</h3>
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
      <Button block onClick={close}>Close</Button>
    </Overlay>
  );
}
