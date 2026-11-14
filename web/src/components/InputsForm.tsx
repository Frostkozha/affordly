import './InputsForm.css';
import { useStore } from '../lib/store';
import { fmtMoney, fmtNum } from '../lib/fmtMoney';
import { Button } from './Button';
import { Chip } from './Chip';
import { Stat } from './Stat';
import { BudgetField } from './BudgetField';
import { AvoidChips } from './AvoidChips';
import { WorkoutList } from './WorkoutList';

export function InputsForm({ locked, go }: {
  locked: () => void;
  go: (tab: string) => void;
}) {
  const { inputs, setInputs, run, solving } = useStore();
  const valid = Number.isFinite(inputs.budget) && inputs.budget >= 10
    && inputs.budget <= 500
    && inputs.kcalPerDay >= 1200
    && inputs.kcalPerDay <= 4000
    && inputs.proteinPerDay >= 40
    && inputs.proteinPerDay <= 300
    && inputs.workouts.every(w => w.start && w.minutes > 0 && w.minutes <= 240);
  return (
    <div className="input-layout">
      <form
        onSubmit={e => {
          e.preventDefault();
          if (valid && !solving) {
            go('plan');
            void run().catch(() => { });
          }
        }}
      >
        <BudgetField
          value={inputs.budget}
          onChange={budget => setInputs({
            ...inputs,
            budget
          })}
        />
        <section>
          <h2>Your daily targets</h2>
          <div className="target-fields">
            <label>
              Calories per day
              <input
                className="num"
                type="number"
                min="1200"
                max="4000"
                required
                value={Number.isNaN(inputs.kcalPerDay) ? '' : inputs.kcalPerDay}
                onChange={e => setInputs({
                  ...inputs,
                  kcalPerDay: e.target.valueAsNumber
                })}
              />
              <small>Average within 10%.</small>
            </label>
            <label>
              Protein per day (g)
              <input
                className="num"
                type="number"
                min="40"
                max="300"
                required
                value={Number.isNaN(inputs.proteinPerDay) ? '' : inputs.proteinPerDay}
                onChange={e => setInputs({
                  ...inputs,
                  proteinPerDay: e.target.valueAsNumber
                })}
              />
              <small>Average at least this.</small>
            </label>
          </div>
          <fieldset>
            <legend>Max cooking time per recipe</legend>
            <div className="chips">
              {[15, 30, 45, 60].map(n =>
                <Chip
                  key={n}
                  selected={inputs.maxCookMinutes === n}
                  onClick={() => setInputs({
                    ...inputs,
                    maxCookMinutes: n
                  })}
                >
                  <span className="num">{n}{' '}min</span>
                </Chip>
              )}
            </div>
          </fieldset>
        </section>
        <AvoidChips inputs={inputs} update={setInputs} />
        <WorkoutList locked={locked} />
        <div className="form-cta">
          <Button primary type="submit" disabled={!valid || solving}>Plan my week</Button>
          {!valid
            &&
            <p className="error">Check the budget, daily targets, and workout fields.</p>
          }
        </div>
      </form>
      <aside className="card glance">
        <span className="eyebrow">Money first. Meals second.</span>
        <h2>Your week at a glance</h2>
        <Stat label="Weekly limit">
          <span className="money summary-money">{fmtMoney(inputs.budget || 0)}</span>
        </Stat>
        <div className="receipt-row">
          <span>Calories per day</span>
          <span className="num">{fmtNum(inputs.kcalPerDay || 0)}{' '}kcal</span>
        </div>
        <div className="receipt-row">
          <span>Protein per day</span>
          <span className="num">{fmtNum(inputs.proteinPerDay || 0)}{' '}g</span>
        </div>
        <div className="receipt-row">
          <span>Cooking time</span>
          <span className="num">{inputs.maxCookMinutes}{' '}min</span>
        </div>
        <div className="receipt-row">
          <span>Avoid</span>
          <span>{inputs.avoid.join(', ') || 'Nothing excluded'}</span>
        </div>
        <p className="meta">
          The receipt total includes whole packages. Anything left over can become next week’s groceries.
        </p>
      </aside>
    </div>
  );
}
