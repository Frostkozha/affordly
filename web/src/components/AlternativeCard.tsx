import { inputDiff } from '../lib/inputDiff';
import './DoesNotFit.css';
import type { Alternative, Inputs } from '@affordly/engine';
import { useStore } from '../lib/store';
import { fmtNum } from '../lib/fmtMoney';
import { Badge } from './Badge';
import { Button } from './Button';
import { Money } from './Money';

export function AlternativeCard({ alternative, apply }: {
  alternative: Alternative;
  apply: (inputs: Inputs, plan: Alternative['plan']) => void;
}) {
  const { inputs } = useStore();
  return (
    <article className="card alternative">
      <Badge>{alternative.kind.replaceAll('-', ' ')}</Badge>
      <h3>{alternative.headline}</h3>
      <p>
        Receipt
        {' '}
        <Money value={alternative.plan.basketCost} />
        {' '}
        · gap
        {' '}
        <Money value={alternative.plan.checkoutGap} />
        {' '}
        ·
        {' '}
        <span className="num">
          {fmtNum(alternative.plan.average.kcal)}
          {' '}
          kcal,
          {' '}
          {fmtNum(alternative.plan.average.protein)}
          {' '}
          g protein, {fmtNum(alternative.plan.average.carbs)} g carbs, {fmtNum(alternative.plan.average.fat)} g fat
        </span>
        {' '}
        per day
      </p>
      <p className="meta num diff">{inputDiff(inputs, alternative.inputs)}</p>
      <Button
        primary
        onClick={() => apply(alternative.inputs, alternative.plan)}
      >
        Use this plan
      </Button>
    </article>
  );
}
