import './InputsForm.css';
import type { Workout } from '@affordly/engine';
import { Button } from './Button';
import { dayNames } from '../lib/config';

export function WorkoutRow({ workout, update, remove, index }: {
  workout: Workout;
  update: (w: Workout) => void;
  remove: () => void;
  index: number;
}) {
  return (
    <div className="workout-row">
      <label>
        Day
        <select
          aria-label={`Workout ${index + 1} day`}
          value={workout.day}
          onChange={e => update({
            ...workout,
            day: Number(e.target.value)
          })}
        >
          {dayNames.map((d, i) =>
            <option key={d} value={i}>{d}</option>
          )}
        </select>
      </label>
      <label>
        Start time
        <input
          type="time"
          value={workout.start}
          required
          onChange={e => update({
            ...workout,
            start: e.target.value
          })}
        />
      </label>
      <label>
        Kind
        <select
          value={workout.kind}
          onChange={e => update({
            ...workout,
            kind: e.target.value as Workout['kind']
          })}
        >
          {['strength', 'cardio', 'mixed'].map(k =>
            <option key={k} value={k}>{k[0].toUpperCase() + k.slice(1)}</option>
          )}
        </select>
      </label>
      <label>
        Minutes
        <input
          type="number"
          min="1"
          max="240"
          required
          value={workout.minutes}
          onChange={e => update({
            ...workout,
            minutes: e.target.valueAsNumber
          })}
        />
      </label>
      <Button type="button" quiet onClick={remove}>Remove</Button>
    </div>
  );
}
