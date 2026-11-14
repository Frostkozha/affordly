import type { Env } from '../http';

const PRIMARY_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const FALLBACK_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8';

type Message = { role: string; content: string };

/** Workers AI models answer in one of several shapes; pull the text out of any of them. */
function textOf(output: unknown): string | null {
  if (typeof output === 'string') return output;
  if (!output || typeof output !== 'object') return null;
  const o = output as {
    response?: unknown;
    choices?: { message?: { content?: unknown } }[];
  };
  if (typeof o.response === 'string') return o.response;
  // JSON-capable models may return the parsed object instead of a string.
  if (o.response && typeof o.response === 'object') return JSON.stringify(o.response);
  const content = o.choices?.[0]?.message?.content;
  return typeof content === 'string' ? content : null;
}

/**
 * One chat completion. Tries the configured model, then the small fallback model.
 * Throws when neither answers, so callers can use their deterministic path.
 */
export async function model(env: Env, messages: Message[], temperature: number, maxTokens = 500): Promise<string> {
  const primary = (env as Env & { ASSISTANT_MODEL?: string }).ASSISTANT_MODEL ?? PRIMARY_MODEL;
  for (const id of [...new Set([primary, FALLBACK_MODEL])]) {
    try {
      const output = await env.AI.run(id, { messages, temperature, max_tokens: maxTokens });
      const text = textOf(output);
      if (text === null) throw new Error('Unrecognised response shape');
      return text.trim();
    } catch (error) {
      // Visible in `wrangler tail`; never returned to the client.
      console.error('assistant model failed', id, error instanceof Error ? error.message : String(error));
    }
  }
  throw new Error('Model unavailable');
}

/** The first JSON object in a model reply, tolerating code fences and stray prose around it. */
export function firstJsonObject(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('No JSON object');
  return JSON.parse(text.slice(start, end + 1));
}
