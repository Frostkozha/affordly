import './InputsForm.css';
import { Stepper } from './Stepper';
export function BudgetField({ value, onChange }: {
  value: number;
  onChange: (n: number) => void
}) {
  const invalid = !Number.isFinite(value) || value < 10 || value > 500;
  return <div className="field budget-field">
    <label htmlFor="budget">Weekly grocery budget</label>
    <Stepper id="budget" label="budget" value={value} min={10} max={500}
      prefix="$" onChange={onChange} />
    <p id="budget-hint" className={invalid ? 'field-error' : 'meta'}>
      {invalid ? 'Enter a budget between $10 and $500.' :
        'Hard limit. The receipt total must stay under this.'}
    </p>
  </div>;
}
