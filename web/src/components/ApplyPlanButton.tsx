import './AssistantDrawer.css';
import { useEffect, useState } from 'react';
import type { AssistantResponse, Inputs } from '@affordly/engine';
import { solvePlan } from '../lib/engine';
import { useStore } from '../lib/store';
import { Button } from './Button';
import { inputDiff } from '../lib/inputDiff';

export function ApplyPlanButton({ response, apply }: {
  response: AssistantResponse;
  apply: (inputs: Inputs) => void;
}) {
  const { inputs, state } = useStore();
  const [valid, setValid] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    if (response.proposedInputs)
      void solvePlan(response.proposedInputs, state.pantry).then(r => {
        if (active)
          setValid(r.ok);
      }).catch(() => {
        if (active)
          setValid(false);
      });
    return () => {
      active = false;
    };
  }, [response.proposedInputs, state.pantry]);
  if (!response.proposedInputs)
    return null;
  return (
    <div>
      <Button
        primary
        disabled={valid !== true}
        onClick={() => apply(response.proposedInputs!)}
      >
        {valid === false ?
          'Does not fit' :
          valid === null ? 'Checking options...' : 'Apply this plan'}
      </Button>
      <p className="meta diff">{inputDiff(inputs, response.proposedInputs)}</p>
    </div>
  );
}
