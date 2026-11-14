import './AssistantDrawer.css';
import type { AssistantResponse, Inputs, Recipe } from '@affordly/engine';
import { getRecipes } from '../lib/engine';
import { RecipeCard } from './RecipeCard';
import { Button } from './Button';

export function AssistantMessage({ response, open, apply, suggest, paywall, disabled = false }: {
  response: AssistantResponse;
  open: (r: Recipe) => void;
  apply: (inputs: Inputs) => void;
  suggest?: (text: string) => void;
  paywall?: () => void;
  disabled?: boolean;
}) {
  return (
    <article className={`assistant-message ${response.refused ? 'refusal' : ''}`}>
      {response.refused && <strong className="badge">Does not fit this request</strong>}
      <p className="assistant-text">{response.text}</p>
      {response.action === 'compare' && response.results &&
        <div className="assistant-comparison">
          <table>
            <caption>Scenario comparison</caption>
            <thead><tr><th>Scenario</th><th>Receipt</th><th>Gap</th><th>Protein</th><th>Fits</th></tr></thead>
            <tbody>{response.results.map((r, index) =>
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{r.ok ? `$${r.plan.basketCost.toFixed(2)}` : '—'}</td>
                <td>{r.ok ? `$${r.plan.checkoutGap.toFixed(2)}` : '—'}</td>
                <td>{r.ok ? `${Math.round(r.plan.average.protein)} g` : '—'}</td>
                <td>{r.ok ? 'Yes' : 'No'}</td>
              </tr>
            )}</tbody>
          </table>
        </div>
      }
      <details className="assistant-source">
        <summary>{response.source === 'model' ? 'AI answer' : 'Checked template'}</summary>
        <p>{response.note ?? 'The answer passed the numeric fact check against the supplied facts.'}</p>
      </details>
      {response.recipeIds.map(id => {
        const r = getRecipes().find(r => r.id === id);
        return r ? <div key={id}>
          <RecipeCard recipe={r} open={open} />
          {response.action === 'how-to-cook' &&
            <a href={r.source.url} target="_blank" rel="noreferrer">{r.source.name}</a>}
        </div> : null;
      })}
      {response.options?.map((option, index) =>
        <Button key={index} primary disabled={disabled} onClick={() => apply(option.inputs)}>
          {option.label}
        </Button>
      )}
      {response.paywall && <Button primary onClick={paywall}>See Plus</Button>}
      <div className="suggestions assistant-followups">
        {response.suggestions.map(text =>
          <Button key={text} disabled={disabled} onClick={() => suggest?.(text)}>{text}</Button>
        )}
      </div>
    </article>
  );
}
