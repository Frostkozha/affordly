import { useEffect, useRef, useState } from 'react';
import { Stepper } from './Stepper';
import { useToast } from '../lib/useToast';
import { suggestTargets, type Body } from '../lib/targets';
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
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState({
    sex: 'female' as Body['sex'], age: '', height: '', weight: '',
    activity: 1.375 as Body['activity'], goal: 0 as Body['goal']
  });
  const panel = useRef<HTMLFieldSetElement>(null);
  useEffect(() => {
    if (open) panel.current?.querySelector<HTMLElement>('button')?.focus();
  }, [open]);
  const within = (v: string, lo: number, hi: number) => v !== '' && +v >= lo && +v <= hi;
  const bodyOk = within(body.age, 14, 90) && within(body.height, 130, 220) && within(body.weight, 35, 200);
  const applyNumbers = () => {
    const t = suggestTargets({
      sex: body.sex, age: +body.age, heightCm: +body.height, weightKg: +body.weight,
      activity: body.activity, goal: body.goal
    });
    setInputs({ ...inputs, ...t });
    setOpen(false);
    notify(`Set to ${fmtNum(t.kcalPerDay)} kcal and ${fmtNum(t.proteinPerDay)} g protein. Change them if you need to.`);
  };
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
          <Button size="sm" aria-expanded={open} aria-controls="auto-targets"
            onClick={() => setOpen(true)}>Auto-calculate</Button>
          {open && <fieldset id="auto-targets" className="auto-targets card" ref={panel}>
            <legend>Auto-calculate from your body</legend>
            <div className="chips" role="group" aria-label="Sex">
              {(['female', 'male'] as const).map(s => (
                <Chip key={s} selected={body.sex === s} onClick={() => setBody({ ...body, sex: s })}>
                  {s === 'female' ? 'Female' : 'Male'}
                </Chip>
              ))}
            </div>
            <div className="auto-targets-grid">
              {([['age', 'Age (years)', 14, 90], ['height', 'Height (cm)', 130, 220],
                ['weight', 'Weight (kg)', 35, 200]] as const).map(([k, text, min, max]) => (
                <label key={k}>
                  {text}
                  <input className="num" type="number" inputMode="decimal" min={min} max={max}
                    value={body[k]} aria-invalid={body[k] !== '' && !(+body[k] >= min && +body[k] <= max)}
                    onChange={e => setBody({ ...body, [k]: e.target.value })} />
                </label>
              ))}
            </div>
            <label>
              Activity
              <select value={body.activity} onChange={e => setBody({ ...body, activity: +e.target.value as Body['activity'] })}>
                <option value={1.2}>Mostly sitting</option>
                <option value={1.375}>Light, 1–3 workouts a week</option>
                <option value={1.55}>Moderate, 3–5 workouts a week</option>
                <option value={1.725}>Very active, 6–7 workouts a week</option>
              </select>
            </label>
            <label>
              Goal
              <select value={body.goal} onChange={e => setBody({ ...body, goal: +e.target.value as Body['goal'] })}>
                <option value={-0.15}>Lose weight</option>
                <option value={0}>Keep weight</option>
                <option value={0.1}>Gain muscle</option>
              </select>
            </label>
            <p className="meta">
              Estimate from the Mifflin-St Jeor formula. You can change the numbers afterwards. Not medical advice.
            </p>
            <div className="auto-targets-actions">
              <Button primary disabled={!bodyOk} onClick={applyNumbers}>Use these numbers</Button>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </fieldset>}
          <div className="target-fields">
            <label>
              Calories per day
              <input
                className="num"
                aria-invalid={inputs.kcalPerDay < 1200 || inputs.kcalPerDay > 4000
                  || !Number.isFinite(inputs.kcalPerDay)}
                aria-describedby="calorie-hint"
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
              <small id="calorie-hint">
                {inputs.kcalPerDay < 1200 || inputs.kcalPerDay > 4000 || !Number.isFinite(inputs.kcalPerDay) ?
                  'Enter calories between 1,200 and 4,000.' : 'Average within 10%.'}
              </small>
            </label>
            <div>
              <label htmlFor="protein">Protein per day (g)</label>
              <Stepper id="protein" label="protein" value={inputs.proteinPerDay} min={40} max={300}
                suffix="g" onChange={proteinPerDay => setInputs({ ...inputs, proteinPerDay })} />
              <p id="protein-hint" className="meta">
                {inputs.proteinPerDay < 40 || inputs.proteinPerDay > 300
                  || !Number.isFinite(inputs.proteinPerDay) ?
                  'Enter protein between 40 and 300 g.' : 'Average at least this.'}
              </p>
            </div>
          </div>
          <fieldset>
            <legend>Max cooking time per recipe</legend>
            <div className="chips cooking-segments">
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
        <fieldset>
          <legend>Variety</legend>
          <div className="chips">
            {([4, 3, 2] as const).map(value => (
              <Chip key={value} selected={(inputs.maxRepeats ?? 3) === value}
                onClick={() => setInputs({ ...inputs, maxRepeats: value })}>
                {value === 4 ? 'Cheapest (repeat meals up to 4 times)' :
                  value === 3 ? 'Balanced' : 'More variety'}
              </Chip>
            ))}
          </div>
          <p className="meta">More variety can cost more. The plan shows the real price either way.</p>
        </fieldset>
        <AvoidChips inputs={inputs} update={setInputs} />
        <WorkoutList locked={locked} />
        <div className="form-cta sticky-cta">
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
