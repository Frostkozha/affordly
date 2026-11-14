import './RecipeDialog.css';
import { useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { getCatalog } from '../lib/engine';
import { fmtMoney } from '../lib/fmtMoney';
export function Button({ primary, quiet, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean; quiet?: boolean }) { return <button {...props} className={`btn ${primary ? 'btn--primary' : ''} ${quiet ? 'btn--quiet' : ''} ${className}`} />; }
export function Chip({ children, selected, onClick }: { children: ReactNode; selected: boolean; onClick: () => void }) { return <button type="button" className="chip" aria-pressed={selected} onClick={onClick}>{children}</button>; }
export function Badge({ children, kind = '' }: { children: ReactNode; kind?: string }) { return <span className={`badge ${kind ? `badge--${kind}` : ''}`}>{children}</span>; }
export function Money({ value, gap = false, big = false, save = false }: { value: number; gap?: boolean; big?: boolean; save?: boolean }) { return <span className={`money ${big ? 'money--big' : ''} ${gap && value > 0 ? 'money--over' : ''} ${save ? 'money--save' : ''}`}>{gap && value > 0 ? '+' : ''}{fmtMoney(value)}</span>; }
export function Stat({ label, children }: { label: string; children: ReactNode }) { return <div className="stat"><span className="meta">{label}</span><div>{children}</div></div>; }
export function SkipLink() { return <a className="skip-link" href="#content" onClick={event => { event.preventDefault(); document.getElementById('content')?.focus(); }}>Skip to content</a>; }
export function PriceSourceLine() { const c = getCatalog(); return <p className="meta">{c.priceSource === 'kroger' ? `Prices: Kroger ${c.store.name}, updated ${new Date(c.pricedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Demo prices, not live store data'}</p>; }
export function EmptyState({ children, action, onAction }: { children: ReactNode; action?: string; onAction?: () => void }) { return <div className="card empty"><p>{children}</p>{action && <Button onClick={onAction}>{action}</Button>}</div>; }
export function ErrorState({ children, retry }: { children: ReactNode; retry: () => void }) { return <div role="alert" className="error"><p>{children}</p><Button onClick={retry}>Retry</Button></div>; }
export function Skeleton() { return <div role="status"><p>Pricing your basket...</p><div className="skeleton" /><div className="skeleton" /></div>; }
export function Overlay({ children, title, onClose, drawer = false }: { children: ReactNode; title: string; onClose: () => void; drawer?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current; dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} aria-label={title} className={drawer ? 'overlay drawer' : 'overlay'} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}><div className="overlay-heading"><h2>{title}</h2><Button aria-label={`Close ${title}`} onClick={onClose}>Close</Button></div>{children}</dialog>;
}
export function CountMoney({ value, gap = false }: { value: number; gap?: boolean }) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(value); return; }
    let frame = 0; const start = performance.now();
    const tick = (now: number) => { const fraction = Math.min((now - start) / 600, 1); setShown(value * (1 - (1 - fraction) ** 3)); if (fraction < 1) frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [value]);
  return <Money value={shown} gap={gap} big save={!gap} />;
}
