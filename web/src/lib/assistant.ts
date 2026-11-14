import type {
  AssistantRequest, AssistantResponse, Inputs, PantryItem, Plan,
} from '@affordly/engine';
import { solvePlan } from './engine';
import { getAccount } from './account';
import { ruleRoute } from '../../../worker/src/assistant/route';
import { answer } from '../../../worker/src/assistant/actions';

type History = NonNullable<AssistantRequest['history']>;
type Progress = (step: string) => void;

async function post(base: string, body: AssistantRequest): Promise<AssistantResponse> {
  const response = await fetch(`${base.replace(/\/$/, '')}/api/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error('Assistant request failed');
  const reply = await response.json() as AssistantResponse;
  if (!reply || typeof reply.text !== 'string' || !Array.isArray(reply.recipeIds)
    || !Array.isArray(reply.suggestions) || !['template', 'model'].includes(reply.source)) {
    throw new Error('Invalid assistant response');
  }
  return reply;
}

export async function ask(message: string, inputs: Inputs, pantry: PantryItem[],
  history: History = [], plan: Plan | null = null, plus = false,
  progress: Progress = () => {}): Promise<AssistantResponse> {
  const body: AssistantRequest = {
    accountId: getAccount()?.id ?? '', message: message.slice(0, 500), inputs, pantry, plan, plus,
    history: history.slice(-6).map(t => ({ role: t.role, text: t.text.slice(0, 500) })),
  };
  const price = async (asked: Inputs[]) => {
    progress(`Pricing ${asked.length} ${asked.length === 1 ? 'scenario' : 'scenarios'}…`);
    const results = [];
    for (const input of asked) results.push(await solvePlan(input, pantry));
    progress('Writing the answer…');
    return results;
  };
  progress('Reading your question…');
  const base = import.meta.env.VITE_API_BASE;
  if (base) {
    try {
      const reply = await post(base, body);
      if (!reply.needsSolve) return reply;
      const asked = reply.needsSolve;
      const results = await price(asked);
      return await post(base, { ...body, asked, results, route: reply.route, ticket: reply.ticket });
    } catch { /* Keep meal planning available without the API. */ }
  }
  const route = ruleRoute(body);
  let data = await answer(body, route);
  if (data.reply.needsSolve) {
    const asked = data.reply.needsSolve;
    const results = await price(asked);
    data = await answer({ ...body, asked, results }, route);
  }
  return { ...data.reply, note: 'Local checked template; AI is unavailable.' };
}
