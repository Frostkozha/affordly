import './RecipeDialog.css';
import { fmtMoney } from '../lib/fmtMoney';

export function Money({ value, gap = false, big = false, save = false }: {
  value: number;
  gap?: boolean;
  big?: boolean;
  save?: boolean;
}) {
  return (
    <span
      className={`money ${big ? 'money--big' : ''} ${
        gap && value > 0 ? 'money--over' : ''
      } ${save ? 'money--save' : ''}`}
    >
      {gap && value > 0 ? '+' : ''}
      {fmtMoney(value)}
    </span>
  );
}
