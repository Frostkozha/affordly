import './RecipeDialog.css';

export function SkipLink() {
  return (
    <a
      className="skip-link"
      href="#content"
      onClick={event => {
        event.preventDefault();
        document.getElementById('content')?.focus();
      }}
    >
      Skip to content
    </a>
  );
}
