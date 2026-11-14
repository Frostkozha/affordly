import './RecipeDialog.css';
import type { ReactNode } from 'react';

export function Badge({ children, kind = '' }: {
  children: ReactNode;
  kind?: string;
}) {
  return (
    <span className={`badge ${kind ? `badge--${kind}` : ''}`}>{children}</span>
  );
}
