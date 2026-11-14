import type { Plan } from '@affordly/engine';
import { getCatalog, getRecipes } from '../../lib/engine';
import { fmtMoney } from '../../lib/fmtMoney';
import { MealThumb } from '../MealThumb';
export function BasketReel({ plan, t }: {
  plan: Plan;
  t: number
}) {
  const lines = [...plan.basket].sort((a, b) => b.cost - a.cost);
  const recipes = [...new Set(plan.meals.map(m => m.recipeId))].slice(0, 4)
    .map(id => getRecipes().find(r => r.id === id)!);
  return <div className="reel-number-content">
    <h2>All of this for <span className="money">{fmtMoney(plan.basketCost)}</span></h2>
    <div className="reel-basket-lines">{lines.slice(0, 7).map((line, i) => {
      const product = getCatalog().products.find(p => p.id === line.productId)!;
      return <div key={line.productId} className="receipt-row reel-timed" data-visible={t >= 600 + i * 650}>
        <div>{product.name}<small>{line.packages} x {product.packageLabel}</small></div>
        <span className="money">{fmtMoney(line.cost)}</span>
      </div>;
    })}
      {lines.length > 7 && <p className="meta">+ {lines.length - 7} more items</p>}</div>
    <div className="reel-thumbs">{recipes.map((recipe, i) =>
      <div key={recipe.id} className="reel-timed" data-visible={t >= 600 + i * 700}>
        <MealThumb recipe={recipe} /></div>)}</div>
    <p className="receipt-row reel-timed" data-visible={t >= 1000 + Math.min(lines.length, 7) * 650}>
      Receipt total <span className="money">{fmtMoney(plan.basketCost)}</span></p>
  </div>;
}
