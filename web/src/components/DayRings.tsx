import { useState, type CSSProperties } from 'react';
import type { Plan } from '@affordly/engine';
import { dayNames } from '../lib/config';
import { getRecipes } from '../lib/engine';
import { isEaten } from '../lib/eaten';
import { useStore } from '../lib/store';
import { fmtNum } from '../lib/fmtMoney';
import './DayRings.css';

const keys = ['kcal', 'protein', 'carbs', 'fat'] as const;
const names = { kcal: 'Calories', protein: 'Protein', carbs: 'Carbs', fat: 'Fat' };
const units = { kcal: 'kcal', protein: 'g', carbs: 'g', fat: 'g' };
const radii = [103, 85, 67, 49];

function dayTotals(plan: Plan, day: number, eaten?: { keys: string[] | undefined; week: number }) {
  const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  const recipes = getRecipes();
  const meals = plan.meals.filter(m => m.day === day && (!eaten || isEaten(eaten.keys, eaten.week, m)));
  for (const meal of meals) {
    const recipe = recipes.find(r => r.id === meal.recipeId);
    if (!recipe) continue;
    for (const key of keys) totals[key] += Math.round(recipe.perServing[key] * meal.servings); // same rounding as each meal row
  }
  return { totals, count: meals.length };
}

function firstOpenDay(plan: Plan, eaten: string[] | undefined, week: number) {
  const open = dayNames.findIndex((_, day) =>
    plan.meals.some(m => m.day === day && !isEaten(eaten, week, m)));
  return open < 0 ? 0 : open;
}

function Ring({ index, pct, empty }: { index: number; pct: number; empty: boolean }) {
  const lap = (value: number) => ({ '--off': 100 - Math.min(Math.max(value, 0), 1) * 100 }) as CSSProperties;
  return (
    <g className={`ring ring-${index}`} data-empty={empty}>
      <circle className="ring-track" r={radii[index]} cx="110" cy="110" />
      <circle className="ring-arc" r={radii[index]} cx="110" cy="110" pathLength="100"
        style={{ ...lap(pct), opacity: pct > 0 ? 1 : 0 }} />
      <circle className="ring-arc ring-arc--lap2" r={radii[index]} cx="110" cy="110" pathLength="100"
        style={{ ...lap(pct - 1), opacity: pct > 1 ? 1 : 0 }} />
    </g>
  );
}

export function DayRings({ plan, picked, setPicked }: {
  plan: Plan;
  picked: number | null;
  setPicked: (day: number) => void;
}) {
  const { state } = useStore();
  // Open on the first unfinished day, then stay there: a day that was just finished shows its full rings.
  const [opened] = useState(() => firstOpenDay(plan, state.eaten, state.week));
  const day = picked ?? opened;
  const { totals, count } = dayTotals(plan, day, { keys: state.eaten, week: state.week });
  // The goal is the day's own planned meals, so a day with every meal ticked reads exactly 100%.
  const targets = dayTotals(plan, day).totals;
  const rows = keys.map((key, i) => {
    const pct = targets[key] > 0 ? totals[key] / targets[key] : 0;
    const text = `${names[key]} ${fmtNum(totals[key])} / ${fmtNum(targets[key])} ${units[key]}`;
    return { key, i, pct, text };
  });
  const label = `${dayNames[day]} rings. ` + rows.map(r => `${r.text}, ${Math.round(r.pct * 100)}%`).join('. ');
  return (
    <section className="day-rings" aria-label="Daily rings">
      <div className="ring-days">
        {dayNames.map((name, d) =>
          <button key={name} type="button" className="chip" aria-pressed={d === day}
            onClick={() => setPicked(d)}>{name}</button>
        )}
      </div>
      <div className="ring-card" data-empty={count === 0}>
        <svg className="ring-svg" viewBox="0 0 220 220" role="img" aria-label={label}>
          <g transform="rotate(-90 110 110)">
            {rows.map(r => <Ring key={r.key} index={r.i} pct={r.pct} empty={count === 0} />)}
          </g>
        </svg>
        <ul className="ring-legend" aria-hidden="true">
          {rows.map(r =>
            <li key={r.key} className={`ring-key-${r.i}`}>
              <span className="ring-dot" />
              <span>{r.text}</span>
              <span className="num">{Math.round(r.pct * 100)}%</span>
            </li>
          )}
        </ul>
        {count === 0 && <p className="ring-empty">Tick a meal to start the day</p>}
      </div>
    </section>
  );
}
