import './AssistantDrawer.css';
import type { AssistantResponse, Inputs, Recipe } from '@affordly/engine';
import { getRecipes } from '../lib/engine';
import { AnswerSourceLabel } from './AnswerSourceLabel';
import { RecipeCard } from './RecipeCard';
import { ApplyPlanButton } from './ApplyPlanButton';
import { RefusalMessage } from './RefusalMessage';

export function AssistantMessage({ response, open, apply }: {
  response: AssistantResponse;
  open: (r: Recipe) => void;
  apply: (inputs: Inputs) => void;
}) {
  return (
    <article
      className={`assistant-message ${response.refused ? 'refusal' : ''}`}
    >
      {response.refused ?
        <RefusalMessage response={response} />
        :
        <p>{response.text}</p>
      }
      <AnswerSourceLabel source={response.source} />
      {response.recipeIds.map(id => {
        const r = getRecipes().find(r => r.id === id);
        return r ?
          <RecipeCard key={id} recipe={r} open={open} />
          :
          null;
      })}
      <ApplyPlanButton response={response} apply={apply} />
    </article>
  );
}
