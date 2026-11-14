import './RecipeDialog.css';

export function Skeleton() {
  return (
    <div role="status">
      <p>Pricing your basket...</p>
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}
