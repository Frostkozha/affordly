import './InputsForm.css';

export function BudgetField({ value, onChange }: {
  value: number;
  onChange: (n: number) => void;
}) {
  const invalid = !Number.isFinite(value) || value < 10 || value > 500;
  return (
    <div className="field budget-field">
      <label htmlFor="budget">Weekly grocery budget</label>
      <div className="budget-input">
        <span aria-hidden="true">$</span>
        <input
          id="budget"
          className="num"
          type="number"
          inputMode="decimal"
          min="10"
          max="500"
          step="1"
          value={Number.isNaN(value) ? '' : value}
          onChange={e => onChange(e.target.valueAsNumber)}
          aria-invalid={invalid}
          aria-describedby="budget-hint"
        />
      </div>
      <p
        id="budget-hint"
        className={invalid ? 'error' : 'meta'}
      >
        {invalid ?
          'Enter a budget between $10 and $500.' :
          'Hard limit. The receipt total must stay under this.'}
      </p>
    </div>
  );
}
