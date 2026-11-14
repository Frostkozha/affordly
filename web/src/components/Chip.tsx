import './RecipeDialog.css';
import type { ReactNode } from 'react';

export function Chip({ children, selected, onClick }: {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="chip"
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
