import { useEffect, useState } from 'react';
import type { Recipe } from '@affordly/engine';
import { useStore } from '../lib/store';
import { Badge, Button, Overlay, PriceSourceLine, SkipLink, Skeleton } from './shared';
import { Landing } from './Landing';
import { InputsForm } from './InputsForm';
import { PlanView, RecipeDialog } from './PlanView';
import { BasketTable, CheckoutGapCard } from './basket';
import { DoesNotFit } from './DoesNotFit';
import { WeekTwo } from './WeekTwo';
import { AccountPage } from './AccountPage';
import { Paywall } from './Paywall';
import { AssistantDrawer } from './AssistantDrawer';
import type { ChatMessage } from './AssistantDrawer';
import './AppShell.css';
const links = [{ name: 'Plan', href: '#/plan#plan' }, { name: 'Basket', href: '#/plan#basket' }, { name: 'Week 2', href: '#/week2' }, { name: 'Account', href: '#/account' }];
function NavLinks({ hash }: { hash: string }) { return <>{links.map(link => <a key={link.name} href={link.href} aria-current={(link.name === 'Plan' ? hash.startsWith('#/plan') && !hash.endsWith('#basket') : hash === link.href) ? 'page' : undefined}>{link.name}</a>)}</>; }
export function TopBar({ hash, ask }: { hash: string; ask: () => void }) { return <header className="top-bar"><div><a className="wordmark" href="#/">Affordly<span className="wordmark-dot">.</span></a><nav aria-label="Main navigation"><NavLinks hash={hash} />{hash !== '#/' && <Button onClick={ask}>Ask Affordly</Button>}</nav></div></header>; }
export function BottomBar({ hash }: { hash: string }) { return <nav className="bottom-bar" aria-label="Mobile navigation"><NavLinks hash={hash} /></nav>; }
export function AppShell() {
  const [hash, setHash] = useState(location.hash || '#/'), [assistant, setAssistant] = useState(false), [paywall, setPaywall] = useState<string | null>(null), [recipe, setRecipe] = useState<{ recipe: Recipe; servings?: number } | null>(null), [messages, setMessages] = useState<ChatMessage[]>([]);
  const { state, result, ready, sample } = useStore();
  useEffect(() => { const change = () => { setHash(location.hash || '#/'); window.scrollTo(0, 0); }; window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);
  const go = (tab: string) => { location.hash = `/plan#${tab}`; };
  const locked = (message = '') => setPaywall(message);
  const open = (r: Recipe, servings?: number) => setRecipe({ recipe: r, servings });
  const landing = hash === '#/' || hash === '', week = hash.startsWith('#/week2'), account = hash.startsWith('#/account');
  const tab = hash.endsWith('#basket') ? 'basket' : hash.endsWith('#inputs') ? 'inputs' : 'plan';
  const plan = result?.ok ? result.plan : null;
  const gated = state.week > 1 && !state.plus;
  return <><SkipLink /><TopBar hash={hash} ask={() => setAssistant(true)} /><main id="content" tabIndex={-1}>{landing ? <Landing go={go} /> : <><div className="device-banner"><span>Saved on this device only.</span><PriceSourceLine /></div>{account ? <AccountPage /> : week ? <WeekTwo locked={locked} go={go} /> : <><div className="page-heading plan-heading"><div><span className="eyebrow">A plan that starts with your limit</span><h1>{tab === 'inputs' ? 'Let’s price your week.' : tab === 'basket' ? 'What you’ll actually pay.' : 'Your week, within reach.'}</h1></div>{sample && <Badge>Sample plan · demo data</Badge>}</div><nav className="sub-tabs" aria-label="Plan sections">{['inputs', 'plan', 'basket'].map(t => <a href={`#/plan#${t}`} key={t} aria-current={tab === t ? 'page' : undefined}>{t[0].toUpperCase() + t.slice(1)}</a>)}</nav>{!ready ? <Skeleton /> : tab === 'inputs' ? <InputsForm locked={locked} go={go} /> : result && !result.ok ? <DoesNotFit result={result} go={go} /> : gated ? <Paywall /> : tab === 'basket' ? <div className="stack">{plan && <CheckoutGapCard plan={plan} budget={state.inputs!.budget} />}<BasketTable plan={plan} locked={locked} /></div> : <PlanView plan={plan} go={go} open={open} />}</>}</>}</main><footer><a href="#/" className="wordmark">Affordly.</a><p>Planning tool, not medical or dietary advice.</p><span className="meta">The whole package. The honest price.</span></footer>{!landing && <><BottomBar hash={hash} /><Button className="ask-float" onClick={() => setAssistant(true)} aria-label="Ask Affordly">Ask</Button></>}{assistant && <AssistantDrawer messages={messages} setMessages={setMessages} close={() => setAssistant(false)} open={open} go={go} />}{paywall !== null && <Overlay title="Affordly Plus" onClose={() => setPaywall(null)}><Paywall message={paywall} unlocked={() => setPaywall(null)} /></Overlay>}{recipe && <RecipeDialog recipe={recipe.recipe} servings={recipe.servings} close={() => setRecipe(null)} />}</>;
}
