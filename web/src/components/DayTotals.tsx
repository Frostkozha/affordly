import './PlanView.css';
import type { Plan } from '@affordly/engine';
import { fmtNum } from '../lib/fmtMoney';

export function DayTotals({ plan, day }: {
  plan: Plan;
  day: number;
}) {
  return (
    <span className="num day-totals">
      {fmtNum(plan.days[day].kcal)}
      {' '}
      kcal ·
      {' '}
      {fmtNum(plan.days[day].protein)}
      {' '}
      g protein
    </span>
  );
}
