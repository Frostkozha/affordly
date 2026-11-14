import { useRef, useState } from 'react';
import type { CreatorApplication } from '@affordly/engine';
import { sendApplication } from './creatorsApi';
import { empty, rateLimited, limitApplications, validate } from './creatorForm';
import type { Draft } from './creatorForm';
export function useCreatorForm() {
  const [draft, setDraft] = useState<Draft>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [limited, setLimited] = useState(rateLimited);
  const [message, setMessage] = useState(rateLimited ?
    'You sent several applications recently. Try again in an hour.' : '');
  const form = useRef<HTMLFormElement>(null);
  const update = (key: keyof Draft, value: string) => {
    setDraft(previous => ({ ...previous, [key]: value }));
    setErrors(previous => ({ ...previous, [key]: '' }));
  };
  const blur = (key: keyof Draft) => {
    setErrors(previous => ({ ...previous, [key]: validate(draft)[key] ?? '' }));
  };
  const focusError = (next: Record<string, string>) => {
    const key = ['name', 'platform', 'handle', 'followers', 'note'].find(field => next[field]);
    requestAnimationFrame(() => {
      form.current?.querySelector<HTMLElement>('[data-field="' + key + '"]')?.focus();
    });
  };
  const submit = async () => {
    const next = validate(draft);
    setErrors(next);
    if (Object.keys(next).length) {
      focusError(next);
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const reply = await sendApplication({
        ...draft, name: draft.name.trim(),
        handle: draft.handle.trim()
      } as CreatorApplication);
      if (reply.ok)
        setSent(true);
      else
        if (reply.status === 429) {
          limitApplications();
          setLimited(true);
          setMessage('You sent several applications recently. Try again in an hour.');
        } else
          if (reply.status === 400 && reply.errors && typeof reply.errors === 'object') {
            const fields = Object.fromEntries(Object.entries(reply.errors)
              .filter(([key]) => key in empty).map(([key, value]) => [key, String(value)]));
            if (Object.keys(fields).length) {
              setErrors(fields);
              focusError(fields);
              setMessage('Check the highlighted fields.');
            } else
              throw new Error('Invalid response');
          } else
            throw new Error('Request failed');
    } catch {
      setMessage('Could not send your application. Nothing was lost: your answers are still here. '
        + 'Try again.');
    } finally {
      setBusy(false);
    }
  };
  return {
    draft, errors, busy, sent, limited, message, form, update, blur, submit,
    reset: () => {
      setSent(false);
      setDraft(empty);
    }
  };
}
