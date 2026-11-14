import './PlanView.css';
import { useState } from 'react';
import type { Plan, PlannedMeal, Recipe } from '@affordly/engine';
import { getCatalog, getRecipes } from '../lib/engine';
import { useStore } from '../lib/store';
import { fmtNum } from '../lib/fmtMoney';
import { Badge, Button, EmptyState, Money, Overlay } from './shared';
import { dayNames } from './InputsForm';
import { CheckoutGapCard } from './basket';
export function MealThumb({ recipe }: { recipe: Recipe }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="meal-thumb placeholder" role="img" aria-label={recipe.name}>{recipe.name[0]}</span> : <img className="meal-thumb" src={recipe.photo} alt={recipe.name} loading="lazy" onError={() => setFailed(true)} />;
}
export function DayTotals({ plan, day }: { plan: Plan; day: number }) { return <span className="num day-totals">{fmtNum(plan.days[day].kcal)} kcal · {fmtNum(plan.days[day].protein)} g protein</span>; }
export function MealRow({ meal, open }: { meal: PlannedMeal; open: (recipe: Recipe, servings?: number) => void }) {
  const { inputs } = useStore(); const recipe = getRecipes().find(r => r.id === meal.recipeId)!;
  const training = meal.slot.includes('workout'), workout = inputs.workouts.find(w => w.day === meal.day);
  const label = meal.slot[0].toUpperCase() + meal.slot.slice(1);
  return <button className="meal-row" onClick={() => open(recipe, meal.servings)}><MealThumb recipe={recipe} /><span><span className="meta">{training ? <Badge kind="plus">{label}</Badge> : label}</span><strong>{recipe.name}{meal.servings > 1 && ` ×${meal.servings}`}</strong><span className="meta num">{meal.time} · {fmtNum(recipe.perServing.kcal * meal.servings)} kcal · {fmtNum(recipe.perServing.protein * meal.servings)} g protein</span>{training && workout && <span className="meta">{workout.kind[0].toUpperCase() + workout.kind.slice(1)} at {workout.start}</span>}</span><span aria-hidden="true">↗</span></button>;
}
export function DayCard({ plan, day, open }: { plan: Plan; day: number; open: (recipe: Recipe, servings?: number) => void }) { return <details className="card day-card" open={day === 0}><summary><strong>{dayNames[day]}</strong><DayTotals plan={plan} day={day} /></summary><div>{plan.meals.filter(m => m.day === day).map(meal => <MealRow key={meal.slot} meal={meal} open={open} />)}</div></details>; }
export function RecipeDialog({ recipe, servings = 1, close }: { recipe: Recipe; servings?: number; close: () => void }) { return <Overlay title={recipe.name} onClose={close}><div className="recipe-hero"><MealThumb recipe={recipe} /></div><p>{recipe.description}</p><p className="num">{recipe.cookMinutes} min · {servings} serving{servings !== 1 ? 's' : ''}</p><p className="num">Per serving: {fmtNum(recipe.perServing.kcal)} kcal · {fmtNum(recipe.perServing.protein)} g protein</p><p className="meta num">{fmtNum(recipe.perServing.carbs)} g carbs · {fmtNum(recipe.perServing.fat)} g fat</p><h3>Ingredients</h3><ul className="ingredients">{recipe.ingredients.map(i => <li key={i.productId}><span>{getCatalog().products.find(p => p.id === i.productId)?.name}</span><span className="num">{fmtNum(i.grams)} g</span></li>)}</ul><h3>Steps</h3><ol>{recipe.steps.map(step => <li key={step}>{step}</li>)}</ol><p className="meta">Source: <a href={recipe.source.url} target="_blank" rel="noopener noreferrer">{recipe.source.name}, {recipe.source.license}</a></p></Overlay>; }
export function PlanView({ plan, go, open }: { plan: Plan | null; go: (tab: string) => void; open: (recipe: Recipe, servings?: number) => void }) {
  const { inputs } = useStore();
  if (!plan) return <EmptyState action="Go to inputs" onAction={() => go('inputs')}>No plan yet. Set your budget and plan the week.</EmptyState>;
  return <><div className="week-strip" aria-live="polite"><div><span className="eyebrow">Your week, priced by the package</span><h2>Receipt total <Money value={plan.basketCost} /> <span className="meta">of <Money value={inputs.budget} /> budget</span></h2></div><Badge kind={plan.basketCost <= inputs.budget ? 'save' : 'over'}>{plan.basketCost <= inputs.budget ? 'Fits' : 'Over budget'}</Badge><progress aria-label="Budget used" value={Math.min(plan.basketCost, inputs.budget)} max={inputs.budget} /></div><div className="plan-layout"><div className="day-grid">{dayNames.map((name, day) => <DayCard key={name} plan={plan} day={day} open={open} />)}</div><aside className="plan-aside"><CheckoutGapCard plan={plan} budget={inputs.budget} /><Button onClick={() => go('basket')}>See the whole basket</Button></aside></div></>;
}
