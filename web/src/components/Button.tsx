import type { ButtonHTMLAttributes } from 'react';
export function Button({ primary, quiet, variant, size = 'md', block, busy,
  disabled, className = '', type = 'button', ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean;
  quiet?: boolean;
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  busy?: boolean;
}) {
  const kind = variant ?? (primary ? 'primary' : quiet ? 'quiet' : 'secondary');
  return <button {...props} type={type} disabled={disabled || busy} aria-busy={busy || undefined}
    className={['btn', 'btn--' + kind, 'btn--' + size, block ? 'btn--block' : '', className].join(' ')} />;
}
