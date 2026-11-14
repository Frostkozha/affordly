import { useId, useState } from 'react';
import type { AccountState } from '@affordly/engine';
import { fmtMoney } from '../lib/fmtMoney';
import './SpendChart.css';

type Week = AccountState['history'][number];

const top = 30;
const base = 190;
const left = 44;
const colW = 56;
const step = 68;
const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];

function niceMax(value: number) {
  const unit = steps.find(s => s * 3 >= value) ?? Math.ceil(value / 3);
  return { unit, max: unit * 3 };
}

// A bar whose top corners are rounded and whose bottom is flat.
function barPath(x: number, y: number, w: number, h: number, round: boolean) {
  const r = round ? Math.min(8, h / 2, w / 2) : 0;
  return `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`;
}

function Column({ week, index, scale, hatch, showBudget }: {
  week: Week;
  index: number;
  scale: number;
  hatch: string;
  showBudget: boolean;
}) {
  const x = left + index * step;
  const spentH = week.basketCost * scale;
  const savedH = week.pantryUsedValue * scale;
  const spentY = base - spentH;
  const savedY = spentY - 2 - savedH;
  const hasSaved = savedH > 0.5;
  const topY = hasSaved ? savedY : spentY;
  const budgetY = week.budget ? base - week.budget * scale : null;
  return (
    <g>
      {spentH > 0 && <path d={barPath(x, spentY, colW, spentH, !hasSaved)} className="sc-spent" />}
      {hasSaved && <path d={barPath(x, savedY, colW, savedH, true)} fill={`url(#${hatch})`} className="sc-saved" />}
      <text x={x + colW / 2} y={topY - 6} className={'sc-label' + (hasSaved ? ' sc-label--save' : '')}
        textAnchor="middle">
        {fmtMoney(hasSaved ? week.pantryUsedValue : week.basketCost)}
      </text>
      {hasSaved && spentH >= 16 && (
        <text x={x + colW / 2} y={spentY + spentH / 2 + 4} className="sc-label sc-label--on-spent"
          textAnchor="middle">
          {fmtMoney(week.basketCost)}
        </text>
      )}
      {budgetY !== null && (
        <g>
          <line x1={x - 4} x2={x + colW + 4} y1={budgetY} y2={budgetY} className="sc-budget" />
          {showBudget && (
            <text x={x + colW + 4} y={budgetY - 4} className="sc-budget-text" textAnchor="end">
              Budget {fmtMoney(week.budget!).replace('.00', '')}
            </text>
          )}
        </g>
      )}
      <text x={x + colW / 2} y={base + 20} className="sc-week" textAnchor="middle">Week {week.week}</text>
    </g>
  );
}

export function SpendChart({ state }: { state: AccountState }) {
  const [all, setAll] = useState(false);
  const hatch = 'hatch' + useId().replace(/:/g, '');
  const history = state.history.filter(h => state.plus || h.week === 1);
  const spent = history.reduce((sum, h) => sum + h.basketCost, 0);
  const saved = history.reduce((sum, h) => sum + h.pantryUsedValue, 0);
  const shown = all ? history : history.slice(-4);
  const tallest = Math.max(1, ...shown.map(h => Math.max(h.basketCost + h.pantryUsedValue, h.budget ?? 0)));
  const { unit, max } = niceMax(tallest);
  const scale = (base - top) / max;
  const width = left + shown.length * step;
  const summary = shown.map(h => `Week ${h.week}: spent ${fmtMoney(h.basketCost)}, saved by using leftovers `
    + `${fmtMoney(h.pantryUsedValue)}${h.budget ? `, budget ${fmtMoney(h.budget)}` : ''}`).join('. ');
  return (
    <section className="card spend-chart">
      <div className="sc-head">
        <h2>Your weeks</h2>
        {history.length > 4 && (
          <div className="sc-seg" role="group" aria-label="Weeks shown">
            <button type="button" aria-pressed={!all} onClick={() => setAll(false)}>Last 4 weeks</button>
            <button type="button" aria-pressed={all} onClick={() => setAll(true)}>All</button>
          </div>
        )}
      </div>
      {!history.length ? (
        <p>No weeks yet. <a href="#/plan#inputs">Plan your first week</a> to see your spending here.</p>
      ) : (
        <>
          <div className="sc-totals">
            <div><span className="meta">Spent so far</span><strong className="money">{fmtMoney(spent)}</strong></div>
            <div><span className="meta">Saved by using leftovers</span>
              <strong className="money money--save">{fmtMoney(saved)}</strong></div>
          </div>
          <div className="sc-scroll">
            <svg viewBox={`0 0 ${width} 214`} style={{ minWidth: width }} role="img" aria-label={summary}>
              <defs>
                <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="6" height="6" className="sc-hatch-bg" />
                  <line x1="0" y1="0" x2="0" y2="6" className="sc-hatch-line" />
                </pattern>
              </defs>
              {[0, 1, 2, 3].map(i => (
                <g key={i}>
                  <line x1={left} x2={width} y1={base - i * unit * scale} y2={base - i * unit * scale}
                    className={i ? 'sc-grid' : 'sc-base'} />
                  <text x={left - 8} y={base - i * unit * scale + 4} className="sc-axis" textAnchor="end">
                    ${i * unit}
                  </text>
                </g>
              ))}
              {shown.map((week, i) => (
                <Column key={week.week} week={week} index={i} scale={scale} hatch={hatch}
                  showBudget={shown.length <= 4 || i === shown.length - 1} />
              ))}
            </svg>
          </div>
          <ul className="sc-legend">
            <li><span className="sc-key sc-key--spent" />Spent</li>
            <li><span className="sc-key sc-key--saved" />Saved by using leftovers</li>
          </ul>
          {history.length === 1 && <p>Simulate next week to see leftovers carried over.</p>}
          <p className="meta">
            Savings count only leftovers you already paid for and used in a later week. The Checkout Gap is
            money spent on food not used that week; it is shown in the table below, not as a saving.
          </p>
        </>
      )}
    </section>
  );
}
