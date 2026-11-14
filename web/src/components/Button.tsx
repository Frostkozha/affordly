import './RecipeDialog.css';
import type { ButtonHTMLAttributes } from 'react';

export function Button({
  primary, quiet, className = '', ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean;
  quiet?: boolean;
}) {
  return (
    <button
      {...props}
      className={`btn ${primary ? 'btn--primary' : ''} ${quiet ? 'btn--quiet' : ''} ${className}`}
    />
  );
}
