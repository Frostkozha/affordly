import './WeekTwo.css';
import { useState } from 'react';
import type { PantryItem, Plan } from '@affordly/engine';
import { getCatalog, nextWeekPantry } from '../lib/engine';
import { useStore } from '../lib/store';
import { fmtNum } from '../lib/fmtMoney';
import { Badge, Button, CountMoney, EmptyState, ErrorState, Money } from './shared';
import { BasketTable, CheckoutGapCard } from './basket';
import { Paywall } from './Paywall';
export function SimulateButton({ click, busy }: { click: () => void; busy: boolean }) { return <div><div className="inline"><Button primary onClick={click} disabled={busy}>{busy ? 'Pricing your basket...' : 'Simulate next week'}</Button><Badge>Demo</Badge></div><p className="meta">Demo time skip: advances 7 days, no real waiting.</p></div>; }
export function LeftoverList({ items, title = 'Pantry preview', spoiled = false }: { items: PantryItem[]; title?: string; spoiled?: boolean }) { return <section><h2>{title}</h2>{!items.length ? <p>{spoiled ? 'No leftovers spoiled.' : 'Nothing left over this week. Week 2 starts from zero.'}</p> : <ul className="leftover-list">{items.map((item, i) => { const p = getCatalog().products.find(p => p.id === item.productId)!; return <li key={`${item.productId}-${i}`} className="receipt-row"><span>{p.name}<span className="meta num">{fmtNum(item.grams)} g · {item.daysLeft === null ? 'shelf stable' : `keeps ${item.daysLeft} more days`}</span></span>{spoiled && <span className="error"><Money value={item.grams / p.packageGrams * p.price} /></span>}</li>; })}</ul>}</section>; }
export function WasteAvoided({ plan }: { plan: Plan }) { return <div className="card waste" aria-live="polite"><span className="eyebrow">Waste avoided</span><CountMoney value={plan.pantryUsedValue} /><p>Leftovers from week 1 used in week 2, valued at store price.</p></div>; }
export function WeekTwo({ locked, go }: { locked: (message?: string) => void; go: (tab: string) => void }) {
  const { state, result, run } = useStore(); const [busy, setBusy] = useState(false), [error, setError] = useState(false), [dropped, setDropped] = useState<PantryItem[]>([]);
  const plan = result?.ok ? result.plan : null;
  const simulate = async () => {
    if (!plan) return; setBusy(true); setError(false);
    try { const carry = nextWeekPantry(plan); setDropped(plan.pantryAfter.filter(p => p.daysLeft !== null && p.daysLeft <= 7)); await run(undefined, carry, state.week + 1); } catch { setError(true); } finally { setBusy(false); }
  };
  if (!plan) return <><h1>Week 2</h1><EmptyState action="Go to inputs" onAction={() => go('inputs')}>No plan yet. Plan week one to see your leftovers.</EmptyState></>;
  return <><div className="page-heading"><span className="eyebrow">Make the next receipt smaller</span><h1>Week 2</h1><p>Leftovers from week 1 count as free groceries in week 2.</p></div><div className="week-layout"><div className="stack">{state.week === 1 ? <><SimulateButton click={() => { void simulate(); }} busy={busy} /><LeftoverList items={nextWeekPantry(plan)} /></> : <><WasteAvoided plan={plan} /><LeftoverList title={`Carried over from week ${state.week - 1}`} items={state.pantry} />{dropped.length > 0 && <LeftoverList items={dropped} title="Spoiled and dropped" spoiled />}{state.plus && <SimulateButton click={() => { void simulate(); }} busy={busy} />}</>}{error && <ErrorState retry={() => { void simulate(); }}>Could not simulate. Your week 1 plan is safe.</ErrorState>}</div><div className="stack">{state.week > 1 ? state.plus ? <><Paywall /><CheckoutGapCard plan={plan} budget={state.inputs!.budget} /></> : <Paywall /> : <div className="card"><h2>Buy once. Use it next week.</h2><p>The food left in your packages has value. Advance a week to see what your next basket can use.</p></div>}</div></div>{state.week > 1 && state.plus && <BasketTable plan={plan} locked={locked} />}</>;
}
