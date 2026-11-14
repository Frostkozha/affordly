import './AssistantDrawer.css';
import type { AssistantResponse } from '@affordly/engine';

export function AnswerSourceLabel({ source }: {
  source: AssistantResponse['source'];
}) {
  return (
    <small>{source === 'template' ? 'Template answer' : 'AI answer, checked by the solver'}</small>
  );
}
