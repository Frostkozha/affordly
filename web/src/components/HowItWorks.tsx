import type { CSSProperties } from 'react';
export function HowItWorks() {
  return <section className="how-it-works"><h2>How it works</h2><ol className="number-steps">
    <li data-reveal style={{ '--i': 0 } as CSSProperties}><h3>Set your limit.</h3><p>Budget, calories, protein, cooking time, what you avoid.</p></li>
    <li data-reveal style={{ '--i': 1 } as CSSProperties}><h3>See the receipt.</h3>
      <p>We pick the meals, then price the whole packages the store sells.</p></li>
    <li data-reveal style={{ '--i': 2 } as CSSProperties}><h3>Fix it or carry it.</h3>
      <p>If it does not fit, you get verified options. Leftovers carry into next week.</p></li>
  </ol></section>;
}
