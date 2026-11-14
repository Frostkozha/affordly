import './PlanView.css';
import type { Plan, Recipe } from '@affordly/engine';
import { dayNames } from '../lib/config';
import { DayTotals } from './DayTotals';
import { MealRow } from './MealRow';

export function DayCard({ plan, day, open }: {
  plan: Plan;
  day: number;
  open: (recipe: Recipe, servings?: number) => void;
}) {
  return (
    <details
      className="card day-card"
      open={day === 0}
    >
      <summary><strong>{dayNames[day]}</strong><DayTotals plan={plan} day={day} /></summary>
      <div>
        {plan.meals.filter(m => m.day === day).map(meal =>
          <MealRow
            key={meal.slot}
            meal={meal}
            open={open}
            cookOnce={meal.slot === 'dinner'
              && plan.meals.some(m => m.day === day && m.slot === 'lunch' && m.recipeId === meal.recipeId)}
          />
        )}
      </div>
    </details>
  );
}
