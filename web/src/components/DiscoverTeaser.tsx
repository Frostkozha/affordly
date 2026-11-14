import { getRecipes } from '../lib/engine';
import { recipePrice } from '../lib/recipePrice';
import { MealThumb } from './MealThumb';
import './Discover.css';
export function DiscoverTeaser() {
  const recipes = [...getRecipes()].sort((a, b) => recipePrice(a) - recipePrice(b)).slice(0, 3);
  if (!recipes.length)
    return null;
  return <section className="card discover-teaser">
    <div><span className="eyebrow">Discover</span><h2>Swipe the meals. Shape next week.</h2>
      <p>Like a meal and Affordly plans more of it. Skip one and it stays off your list.</p>
      <a href="#/discover" className="btn">Open Discover</a></div>
    <div className="teaser-thumbs">{recipes.map((recipe, i) =>
      <div key={recipe.id} style={{ transform: 'rotate(' + (i - 1) * 4 + 'deg)' }}>
        <MealThumb recipe={recipe} /></div>)}</div>
  </section>;
}
