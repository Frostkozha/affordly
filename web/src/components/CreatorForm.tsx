import { platforms, followers } from '../lib/creatorForm';
import { useCreatorForm } from '../lib/useCreatorForm';
import { Button } from './Button';
import { CreatorChoice } from './CreatorChoice';
import { CreatorSuccess } from './CreatorSuccess';
export function CreatorForm() {
  const { draft, errors, busy, sent, limited, message, form,
    update, blur, submit, reset } = useCreatorForm();
  if (sent)
    return <CreatorSuccess reset={reset} />;
  return <form ref={form} className="card creator-form" noValidate onSubmit={event => {
    event.preventDefault();
    if (!busy && !limited)
      void submit();
  }}>
    <fieldset disabled={busy}>
      <label htmlFor="creator-name">Your name</label>
      <input id="creator-name" data-field="name" autoComplete="name" value={draft.name}
        aria-invalid={Boolean(errors.name)} aria-describedby="creator-name-error"
        onChange={event => update('name', event.target.value)} onBlur={() => blur('name')} />
      <p className="field-error" id="creator-name-error">{errors.name}</p>
      <CreatorChoice field="platform" label="Where you post" options={platforms} value={draft.platform}
        error={errors.platform} change={value => update('platform', value)} blur={() => blur('platform')} />
      <label htmlFor="creator-handle">Handle or link</label>
      <input id="creator-handle" data-field="handle" value={draft.handle}
        placeholder="@yourname or a profile link" aria-invalid={Boolean(errors.handle)}
        aria-describedby="creator-handle-hint creator-handle-error"
        onChange={event => update('handle', event.target.value)} onBlur={() => blur('handle')} />
      <p className="meta" id="creator-handle-hint">This is how we contact you.</p>
      <p className="field-error" id="creator-handle-error">{errors.handle}</p>
      <CreatorChoice field="followers" label="Followers" options={followers} value={draft.followers}
        error={errors.followers} change={value => update('followers', value)}
        blur={() => blur('followers')} />
      <label htmlFor="creator-note">Anything we should know? (optional)</label>
      <textarea id="creator-note" data-field="note" rows={4} value={draft.note}
        aria-invalid={Boolean(errors.note)} aria-describedby="creator-note-error creator-counter"
        onChange={event => update('note', event.target.value)} onBlur={() => blur('note')} />
      <p id="creator-counter" className={'num meta' + (draft.note.length >= 500 ? ' error' : '')}>
        {draft.note.length} / 500</p>
      <p className="field-error" id="creator-note-error">{errors.note}</p>
    </fieldset>
    {message && <p role="alert" className="creator-error">{message}</p>}
    <Button primary size="lg" block type="submit" busy={busy} disabled={limited}>
      {limited ? 'Try again later' : 'Send application'}</Button>
  </form>;
}
