import './AccountPage.css';
import type { AccountState } from '@affordly/engine';
import { Money } from './Money';

export function HistoryTable({ state }: {
  state: AccountState;
}) {
  return (
    <section className="card history">
      <h2>Week history</h2>
      {!state.history.length ?
        <p>No weeks yet. Plan one to start your history.</p>
        :
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {['Week', 'Receipt', 'Budget', 'Gap', 'Saved'].map((name, i) =>
                  <th key={name} scope="col" className={i ? 'num' : ''}>{name}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {state.history.filter(h => state.plus || h.week === 1).map(h =>
                <tr key={h.week}>
                  <th scope="row" className="num">{h.week}</th>
                  <td className="num"><Money value={h.basketCost} /></td>
                  <td className="num">{h.budget === undefined ? '—' : <Money value={h.budget} />}</td>
                  <td className="num"><Money value={h.checkoutGap} gap /></td>
                  <td className="num"><Money value={h.pantryUsedValue} save /></td>
                </tr>
              )}
              {!state.plus
                &&
                <tr><td colSpan={5}>Week 2 onward is in Plus.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  );
}
