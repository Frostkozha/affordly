import './InputsForm.css';
import type { Inputs } from '@affordly/engine';
import { Chip } from './Chip';
const avoids = ['fish', 'meat', 'poultry', 'pork', 'dairy', 'egg', 'gluten', 'nuts', 'soy'];

export function AvoidChips({ inputs, update }: {
  inputs: Inputs;
  update: (next: Inputs) => void;
}) {
  return (
    <section>
      <h2>Foods to avoid</h2>
      <p className="meta">Tap to exclude. "meat" means beef and lamb.</p>
      <div className="chips">
        {avoids.map(tag =>
          <Chip
            key={tag}
            selected={inputs.avoid.includes(tag)}
            onClick={() => update({
              ...inputs,
              avoid: inputs.avoid.includes(tag) ?
                inputs.avoid.filter(t => t !== tag) :
                [...inputs.avoid, tag]
            })}
          >
            {tag}
          </Chip>
        )}
      </div>
    </section>
  );
}
