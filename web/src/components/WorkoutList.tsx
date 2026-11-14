import './InputsForm.css';
import { useStore } from '../lib/store';
import { Badge } from './Badge';
import { Button } from './Button';
import { WorkoutRow } from './WorkoutRow';

export function WorkoutList({ locked }: {
  locked: () => void;
}) {
  const { inputs, setInputs, state } = useStore();
  return (
    <section>
      <h2>Workouts (optional){' '}<Badge kind="plus">Plus</Badge></h2>
      <p>Plus adds pre-workout and post-workout meals around your sessions.</p>
      {inputs.workouts.map((workout, index) =>
        <WorkoutRow
          key={index}
          index={index}
          workout={workout}
          update={w => setInputs({
            ...inputs,
            workouts: inputs.workouts.map((old, i) => i === index ? w : old)
          })}
          remove={() => setInputs({
            ...inputs,
            workouts: inputs.workouts.filter((_, i) => i !== index)
          })}
        />
      )}
      {!state.plus
        &&
        <p className="meta">Unlock demo to place training meals</p>
      }
      <Button
        type="button"
        onClick={() => {
          setInputs({
            ...inputs,
            workouts: [...inputs.workouts, {
              day: 0,
              start: '17:30',
              kind: 'strength',
              minutes: 45
            }]
          });
          if (!state.plus)
            locked();
        }}
      >
        Add workout
      </Button>
    </section>
  );
}
