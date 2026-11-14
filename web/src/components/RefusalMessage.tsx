import './AssistantDrawer.css';
import type { AssistantResponse } from '@affordly/engine';
import { Badge } from './Badge';
import { Money } from './Money';

export function RefusalMessage({ response }: {
  response: AssistantResponse;
}) {
  const minimum = response.result && !response.result.ok ?
    response.result.alternatives.find(a => a.kind === 'min-budget') :
    null;
  return (
    <>
      <Badge kind="over">Cannot do that</Badge>
      <p>{response.text}</p>
      {minimum
        &&
        <p>Lowest price that works:{' '}<Money value={minimum.plan.basketCost} /></p>
      }
      {response.intent === 'medical'
        &&
        <p>Affordly is a planning tool, not medical advice.</p>
      }
    </>
  );
}
