import type { ButtonHTMLAttributes, PointerEvent } from 'react';
export function Button({ primary, quiet, variant, size = 'md', block, busy,
  disabled, className = '', type = 'button', onPointerMove, ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean;
  quiet?: boolean;
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  busy?: boolean;
}) {
  const kind = variant ?? (primary ? 'primary' : quiet ? 'quiet' : 'secondary');
  const track = (e: PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', e.clientX - r.left + 'px');
    e.currentTarget.style.setProperty('--my', e.clientY - r.top + 'px');
    onPointerMove?.(e);
  };
  return <button {...props} type={type} onPointerMove={kind === 'primary' ? track : onPointerMove} disabled={disabled || busy} aria-busy={busy || undefined}
    className={['btn', 'btn--' + kind, 'btn--' + size, block ? 'btn--block' : '', className].join(' ')} />;
}
