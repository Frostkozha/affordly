export function CreatorChoice({ field, label, value, options, error, change, blur }: {
  field: string;
  label: string;
  value: string;
  options: Record<string, string>;
  error?: string;
  change: (value: string) => void;
  blur: () => void;
}) {
  const errorId = 'creator-' + field + '-error';
  return <fieldset aria-describedby={errorId} aria-invalid={Boolean(error)}>
    <legend>{label}</legend><div className="chips">
      {Object.entries(options).map(([key, text], i) => <button key={key} type="button" className="chip"
        data-field={i === 0 ? field : undefined} aria-pressed={value === key}
        aria-describedby={errorId} aria-invalid={Boolean(error)} onBlur={blur}
        onClick={() => change(key)}>{text}</button>)}
    </div><p className="field-error" id={errorId}>{error}</p>
  </fieldset>;
}
