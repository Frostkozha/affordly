import './AssistantDrawer.css';
import { useEffect, useRef, useState } from 'react';
import type { AssistantResponse, Inputs, Recipe } from '@affordly/engine';
import { ask } from '../lib/assistant';
import { getRecipes, solvePlan } from '../lib/engine';
import { useStore } from '../lib/store';
import { Badge, Button, ErrorState, Money, Overlay } from './shared';
import { MealThumb } from './PlanView';
import { fmtNum } from '../lib/fmtMoney';
import { inputDiff } from './DoesNotFit';
export function AnswerSourceLabel({ source }: { source: AssistantResponse['source'] }) { return <small>{source === 'template' ? 'Template answer' : 'AI answer, checked by the solver'}</small>; }
export function RecipeCard({ recipe, open }: { recipe: Recipe; open: (r: Recipe) => void }) { return <button className="recipe-card" onClick={() => open(recipe)}><MealThumb recipe={recipe} /><span><strong>{recipe.name}</strong><span className="meta num">{recipe.cookMinutes} min · {fmtNum(recipe.perServing.kcal)} kcal · {fmtNum(recipe.perServing.protein)} g protein</span></span></button>; }
export function ApplyPlanButton({ response, apply }: { response: AssistantResponse; apply: (inputs: Inputs) => void }) {
  const { inputs, state } = useStore(); const [valid, setValid] = useState<boolean | null>(null);
  useEffect(() => { let active = true; if (response.proposedInputs) void solvePlan(response.proposedInputs, state.pantry).then(r => { if (active) setValid(r.ok); }).catch(() => { if (active) setValid(false); }); return () => { active = false; }; }, [response.proposedInputs, state.pantry]);
  if (!response.proposedInputs) return null;
  return <div><Button primary disabled={valid !== true} onClick={() => apply(response.proposedInputs!)}>{valid === false ? 'Does not fit' : valid === null ? 'Checking options...' : 'Apply this plan'}</Button><p className="meta diff">{inputDiff(inputs, response.proposedInputs)}</p></div>;
}
export function RefusalMessage({ response }: { response: AssistantResponse }) { const minimum = response.result && !response.result.ok ? response.result.alternatives.find(a => a.kind === 'min-budget') : null; return <><Badge kind="over">Cannot do that</Badge><p>{response.text}</p>{minimum && <p>Lowest price that works: <Money value={minimum.plan.basketCost} /></p>}{response.intent === 'medical' && <p>Affordly is a planning tool, not medical advice.</p>}</>; }
export function AssistantMessage({ response, open, apply }: { response: AssistantResponse; open: (r: Recipe) => void; apply: (inputs: Inputs) => void }) { return <article className={`assistant-message ${response.refused ? 'refusal' : ''}`}>{response.refused ? <RefusalMessage response={response} /> : <p>{response.text}</p>}<AnswerSourceLabel source={response.source} />{response.recipeIds.map(id => { const r = getRecipes().find(r => r.id === id); return r ? <RecipeCard key={id} recipe={r} open={open} /> : null; })}<ApplyPlanButton response={response} apply={apply} /></article>; }
export interface ChatMessage { user: string; response?: AssistantResponse }
export function AssistantDrawer({ close, open, go, messages, setMessages }: { close: () => void; open: (r: Recipe) => void; go: (tab: string) => void; messages: ChatMessage[]; setMessages: (messages: ChatMessage[]) => void }) {
  const { inputs, state, run } = useStore(); const [draft, setDraft] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(false), [last, setLast] = useState(''); const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [messages, busy]);
  const send = async (message: string) => { if (!message.trim() || busy) return; setLast(message); setDraft(''); setBusy(true); setError(false); const next = [...messages, { user: message }]; setMessages(next); try { const response = await ask(message, inputs, state.pantry); setMessages([...messages, { user: message, response }]); } catch { setError(true); } finally { setBusy(false); } };
  return <Overlay title="Ask Affordly" drawer onClose={close}><p className="meta">Ask about your budget, swaps, or a recipe.</p><div className="messages" aria-live="polite">{!messages.length && <div className="suggestions">{['Cheapest week for my protein', 'Swap the most expensive item', 'A cheap dinner without dairy'].map(text => <Button key={text} onClick={() => { void send(text); }}>{text}</Button>)}</div>}{messages.map((message, index) => <div key={index}><p className="user-message">{message.user}</p>{message.response && <AssistantMessage response={message.response} open={open} apply={next => { void run(next).then(() => { close(); go('plan'); }); }} />}</div>)}{busy && <p role="status">Checking the numbers...</p>}{error && <ErrorState retry={() => { setMessages(messages.slice(0, -1)); void send(last); }}>Assistant is offline. Your plan still works.</ErrorState>}<div ref={end} /></div><form className="assistant-input" onSubmit={e => { e.preventDefault(); void send(draft); }}><label className="sr-only" htmlFor="question">Ask Affordly a question</label><input id="question" placeholder={'Ask something, e.g. "What is the cheapest week with 150 g protein?"'} value={draft} onChange={e => setDraft(e.target.value)} /><Button primary type="submit" disabled={busy || !draft.trim()}>Send</Button></form></Overlay>;
}
