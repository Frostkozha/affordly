import './PlanView.css';
import type { PlannedMeal, Recipe } from '@affordly/engine';
import { getRecipes } from '../lib/engine';
import { useStore } from '../lib/store';
import { fmtNum } from '../lib/fmtMoney';
import { Badge } from './Badge';
import { MealThumb } from './MealThumb';

export function MealRow({ meal, open, cookOnce = false }: {
  meal: PlannedMeal;
  cookOnce?: boolean;
  open: (recipe: Recipe, servings?: number) => void;
}) {
  const { inputs } = useStore();
  const recipe = getRecipes().find(r => r.id === meal.recipeId)!;
  const training = meal.slot.includes('workout');
  const workout = inputs.workouts.find(w => w.day === meal.day);
  const label = meal.slot[0].toUpperCase() + meal.slot.slice(1);
  return (
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
  );
}
