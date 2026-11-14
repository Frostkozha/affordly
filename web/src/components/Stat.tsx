import './RecipeDialog.css';
import type { ReactNode } from 'react';

export function Stat({ label, children }: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="stat"><span className="meta">{label}</span><div>{children}</div></div>
  );
}
