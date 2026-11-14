import './PlanView.css';
import type { PlannedMeal, Recipe } from '@affordly/engine';
import { getRecipes } from '../lib/engine';
import { useStore } from '../lib/store';
import { eatenKey, isEaten } from '../lib/eaten';
import { EatenCheck } from './EatenCheck';
import { fmtNum } from '../lib/fmtMoney';
import { Badge } from './Badge';
import { MealThumb } from './MealThumb';

export function MealRow({ meal, open, cookOnce = false }: {
  meal: PlannedMeal;
  cookOnce?: boolean;
  open: (recipe: Recipe, servings?: number) => void;
}) {
  const { inputs, state, toggleEaten } = useStore();
  const recipe = getRecipes().find(r => r.id === meal.recipeId)!;
  const training = meal.slot.includes('workout');
  const workout = inputs.workouts.find(w => w.day === meal.day);
  const label = meal.slot[0].toUpperCase() + meal.slot.slice(1);
  const eaten = isEaten(state.eaten, state.week, meal);
  return (
    <div className="meal-line" data-eaten={eaten}>
    <button
      className="meal-row"
      onClick={() => open(recipe, meal.servings)}
    >
      <MealThumb recipe={recipe} />
      <span>
        <span className="meta">{training ? <Badge kind="plus"> {label} </Badge> : label}</span>
        <strong>{recipe.name}{meal.servings !== 1 && ` (${meal.servings} servings)`}</strong>
        <span className="meta num">
          {meal.time}
          {' '}
          ·
          {' '}
          {fmtNum(recipe.perServing.kcal * meal.servings)}
          {' '}
          kcal ·
          {' '}
          {fmtNum(recipe.perServing.protein * meal.servings)}
          {' '}
          g protein
        </span>
        {cookOnce &&
          <span className="meta">cook once, eat twice</span>
        }
        {training && workout
          &&
          <span className="meta">
            {workout.kind[0].toUpperCase() + workout.kind.slice(1)}
            {' '}
            at
            {' '}
            {workout.start}
          </span>
        }
      </span>
      <span aria-hidden="true">↗</span>
    </button>
    <EatenCheck
      name={recipe.name}
      checked={eaten}
      onToggle={() => toggleEaten(eatenKey(state.week, meal))}
    />
    </div>
  );
}
