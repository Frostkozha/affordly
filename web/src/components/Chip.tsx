import { Icon } from './art/Icons';
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
      {selected && <Icon name="check" size={14} />}
      {children}
    </button>
  );
}
