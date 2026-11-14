// Minimal structural runtime types; no additional development dependency required.
export interface Statement {
  bind(...values: unknown[]): Statement;
  first<T>(): Promise<T | null>;
  run(): Promise<{ success: boolean; meta: { changes?: number } }>;
}
export interface Env {
  DB: { prepare(sql: string): Statement };
  AI: { run(model: string, inputs: unknown): Promise<unknown> };
  KROGER_BASE: string;
  ALLOWED_ORIGIN: string;
  KROGER_CLIENT_ID: string;
  KROGER_CLIENT_SECRET: string;
}
export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const json = (body: unknown, status = 200) => Response.json(body, { status });

export async function readJson(request: Request): Promise<unknown> {
  const limit = 64 * 1024;
  if (Number(request.headers.get('content-length')) > limit) throw new HttpError(413, 'Body too large');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Invalid JSON');
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) { await reader.cancel(); throw new HttpError(413, 'Body too large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new HttpError(400, 'Invalid JSON'); }
}
