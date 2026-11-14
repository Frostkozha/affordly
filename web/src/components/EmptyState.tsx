import './RecipeDialog.css';
import type { ReactNode } from 'react';
import { Button } from './Button';

export function EmptyState({ children, action, onAction }: {
  children: ReactNode;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="card empty">
      <p>{children}</p>
      {action &&
        <Button onClick={onAction}>{action}</Button>
      }
    </div>
  );
}
