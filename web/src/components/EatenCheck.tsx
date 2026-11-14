export function EatenCheck({ name, checked, onToggle }: {
  name: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      className="eaten-check"
      aria-checked={checked}
      aria-label={`Mark ${name} as eaten`}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 12.5l4 4 8-9" />
      </svg>
    </button>
  );
}
