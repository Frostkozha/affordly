import './RecipeDialog.css';
import type { ReactNode } from 'react';
import { Button } from './Button';

export function ErrorState({ children, retry }: {
  children: ReactNode;
  retry: () => void;
}) {
  return (
    <div
      role="alert"
      className="error"
    >
      <p>{children}</p>
      <Button onClick={retry}>Try again</Button>
    </div>
  );
}
