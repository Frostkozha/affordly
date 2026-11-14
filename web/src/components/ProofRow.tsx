import type { CSSProperties } from 'react';
import { Icon } from './art/Icons';
export function ProofRow() {
  return <div className="proof-row">
    <p data-reveal style={{ '--i': 0 } as CSSProperties}><Icon name="tag" />Real store prices</p>
    <p data-reveal style={{ '--i': 1 } as CSSProperties}><Icon name="box" />Whole packages</p>
    <p data-reveal style={{ '--i': 2 } as CSSProperties}><Icon name="no" />Says no when it doesn't fit</p>
  </div>;
}
