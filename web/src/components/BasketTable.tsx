import './CheckoutGapCard.css';
import './BasketTable.css';
import type { Inputs, Plan } from '@affordly/engine';
import { swapProduct } from '../lib/engine';
import { demoTerms } from '../lib/config';
import { useStore } from '../lib/store';
import { EmptyState } from './EmptyState';
import { BasketLine } from './BasketLine';
import { BasketTotal } from './BasketTotal';

export function BasketTable({ plan, locked }: {
  plan: Plan | null;
  locked: (message?: string) => void;
}) {
  const { state, inputs, run, reprice, swaps, recordSwap } = useStore();
  if (!plan)
    return (
      <EmptyState>No basket until there is a plan.</EmptyState>);
  const changed = async () => {
    await reprice();
  };
  const swap = async (id: string) => {
    if (!state.plus && swaps >= demoTerms.freeSwaps) {
      locked('Unlimited swaps are in Plus.');
      return;
    }
    recordSwap();
    const next: Inputs = swapProduct(inputs, id);
    await run(next);
  };
  return (
    <section className="card basket">
      <div className="section-top">
        <h2>Your basket</h2>
        {!state.plus
          &&
          <small className="num">
            {Math.max(0, demoTerms.freeSwaps - swaps)}
            {' '}
            of
            {' '}
            {demoTerms.freeSwaps}
            {' '}
            free swaps left
          </small>
        }
      </div>
      <table>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Packages</th>
            <th scope="col" className="num">Cost</th>
            <th scope="col" className="num">Left</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plan.basket.map(line =>
            <BasketLine key={line.productId} line={line} changed={changed} swap={swap} />
          )}
        </tbody>
      </table>
      <BasketTotal plan={plan} />
    </section>
  );
}
