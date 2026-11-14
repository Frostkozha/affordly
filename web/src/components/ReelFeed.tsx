import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Recipe, SolveResult } from '@affordly/engine';
import { useStore } from '../lib/store';
import { defaultInputs } from '../lib/config';
import { solvePlan } from '../lib/engine';
import { reelData } from '../lib/reelData';
import { useReducedMotion } from '../lib/useReducedMotion';
import { useToast } from '../lib/useToast';
import { Reel } from './Reel';
import { ReceiptSkeleton } from './ReceiptSkeleton';
import './Reels.css';
export function ReelFeed({ open }: {
  open: (recipe: Recipe) => void
}) {
  const { state, result, solving, solveError, ready } = useStore();
  const [sampleResult, setSampleResult] = useState<SolveResult | null>(null);
  const [sampleError, setSampleError] = useState('');
  const [active, setActive] = useState(0);
  const feed = useRef<HTMLElement>(null);
  const pending = useRef<Promise<SolveResult> | null>(null);
  const reduced = useReducedMotion();
  const { notify } = useToast();
  const sample = !state.currentPlan;
  const resolved = result ?? (sample ? sampleResult : null);
  const plan = resolved?.ok ? resolved.plan : state.currentPlan;
  useEffect(() => {
    if (!ready || !sample || result || solving || solveError)
      return;
    let mounted = true;
    pending.current ??= solvePlan(defaultInputs, []);
    pending.current.then(value => {
      if (mounted)
        setSampleResult(value);
    })
      .catch(() => {
        if (mounted)
          setSampleError('Could not price the sample week.');
      });
    return () => {
      mounted = false;
    };
  }, [ready, sample, result, solving, solveError]);
  const items = useMemo(() => plan ? reelData(plan, sample, state.week) : [], [plan, sample, state.week]);
  useEffect(() => {
    const container = feed.current;
    if (!container)
      return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries)
        if (entry.intersectionRatio >= .6)
          setActive(Number((entry.target as HTMLElement).dataset.index));
    }, { root: container, threshold: .6 });
    container.querySelectorAll('.reel').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);
  useLayoutEffect(() => {
    const container = feed.current;
    if (!container)
      return;
    const resize = () => {
      container.style.setProperty('--feed-top', container.getBoundingClientRect().top + 'px');
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [items.length, sample]);
  const navigate = (index: number) => {
    feed.current?.querySelectorAll('.reel')[index]?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth', block: 'nearest',
    });
  };
  const error = solveError || sampleError || (resolved && !resolved.ok ? resolved.reason : '');
  if (error)
    return <section className="card not-fit" role="alert"><div>
      <span className="badge badge--over">Does not fit</span><p>{error}</p>
      <a href="#/plan#inputs" className="btn">Edit inputs</a></div></section>;
  if (!ready || solving || !plan)
    return <ReceiptSkeleton />;
  return <div className="reels-layout">
    <aside className="reels-explainer"><p>{sample ? 'Made from a sample plan' : 'Made from your plan'}</p>
      {sample && <><p>Plan your own week and these cards fill with your numbers.</p>
        <a className="btn" href="#/plan#inputs">Plan my week</a></>}
      <nav aria-label="Reels">{items.map((item, i) => <button key={item.id} className="btn btn--quiet"
        aria-current={active === i ? 'true' : undefined} onClick={() => navigate(i)}>
        {item.title}</button>)}</nav>
    </aside>
    <section className="reel-feed" ref={feed} tabIndex={0} aria-label="Reels made from your plan"
      onKeyDown={event => {
        if ((event.target as HTMLElement).closest('button, a'))
          return;
        if (['ArrowDown', 'j', 'J', 'ArrowUp', 'k', 'K', ' '].includes(event.key))
          event.preventDefault();
        if (['ArrowDown', 'j', 'J'].includes(event.key))
          navigate(Math.min(items.length - 1, active + 1));
        if (['ArrowUp', 'k', 'K'].includes(event.key))
          navigate(Math.max(0, active - 1));
        if (event.key === ' ')
          feed.current?.querySelectorAll('.reel')[active]
            ?.querySelector<HTMLButtonElement>('button.sr-only')?.click();
      }}>
      {items.map((item, index) => <Reel key={item.id} data={item} plan={plan} active={active === index}
        sample={sample} index={index} total={items.length} navigate={navigate}
        open={open} notify={notify} />)}
    </section>
  </div>;
}
