import { useId, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Plan, Recipe } from '@affordly/engine';
import { dayNames } from '../lib/config';
import { useStore } from '../lib/store';
import { isEaten } from '../lib/eaten';
import { DayTotals } from './DayTotals';
import { MealRow } from './MealRow';
import './PlanView.css';
export function DayCard({ plan, day, open, focusDay = null }: {
  plan: Plan;
  day: number;
  focusDay?: number | null;
  open: (recipe: Recipe, servings?: number) => void;
}) {
  const [expanded, setExpanded] = useState(day === 0);
  const id = useId();
  const [seenFocus, setSeenFocus] = useState(focusDay);
  if (focusDay !== seenFocus) {
    setSeenFocus(focusDay);
    if (focusDay !== null)
      setExpanded(focusDay === day);
  }
  const { state } = useStore();
  const meals = plan.meals.filter(meal => meal.day === day);
  const eatenCount = meals.filter(meal => isEaten(state.eaten, state.week, meal)).length;
  return <article className="card day-card" style={{ '--i': day } as CSSProperties}>
    <button className="day-toggle" aria-expanded={expanded} aria-controls={id}
      onClick={() => setExpanded(value => !value)}>
      <span><strong>{dayNames[day]}</strong><DayTotals plan={plan} day={day} />
        <span className="meta day-eaten">{eatenCount} of {meals.length} eaten</span></span>
      <span aria-hidden="true">{expanded ? '−' : '+'}</span>
    </button>
    <div id={id} className="day-expand" data-expanded={expanded} inert={!expanded}
      aria-hidden={!expanded}><div>
        {meals.map(meal => <MealRow key={meal.slot} meal={meal} open={open}
          cookOnce={meal.slot === 'dinner'
            && meals.some(other => other.slot === 'lunch' && other.recipeId === meal.recipeId)} />)}
      </div></div>
  </article>;
}
