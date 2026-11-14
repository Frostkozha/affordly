import type { CreatorApplication } from '@affordly/engine';
export const creatorsBase = import.meta.env.VITE_API_BASE?.replace(/\/$/, '');
export type CreatorReply = {
  ok: boolean;
  status: number;
  errors?: Record<string, string>
};
export async function sendApplication(application: CreatorApplication): Promise<CreatorReply> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(creatorsBase + '/api/creators', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(application), signal: controller.signal,
    });
    const body = await response.json().catch(() => ({}));
    const fields = body.errors ?? body.fieldErrors ?? body.fields;
    const errors = Array.isArray(fields) ? Object.fromEntries(fields.map(field =>
      typeof field === 'string' ? [field, 'Check this field.'] :
        [field.field, field.message ?? 'Check this field.'])) : fields;
    return {
      ok: response.ok && body.ok === true, status: response.status,
      errors: errors ?? (body.field ? { [body.field]: body.error ?? 'Check this field.' } : undefined)
    };
  } finally {
    clearTimeout(timer);
  }
}
