import { Icon } from './art/Icons';
import { DiscoverTeaser } from './DiscoverTeaser';
import './Landing.css';
import { Fragment, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Plan, SolveResult } from '@affordly/engine';
import { solvePlan } from '../lib/engine';
import { defaultInputs } from '../lib/config';
import { useStore } from '../lib/store';
import { Button } from './Button';
import { HeroReceipt } from './HeroReceipt';
import { ProofRow } from './ProofRow';
import { HowItWorks } from './HowItWorks';
import { PriceBadge } from './PriceBadge';
import { ReceiptSkeleton } from './ReceiptSkeleton';
import { useReveal } from '../lib/useReveal';

const HEADLINE = 'Plan the week you can actually afford.';

export function Landing({ go }: {
  go: (tab: string) => void;
}) {
  const { useSample: loadSample, solving, ready } = useStore();
  const [proof, setProof] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const sampleSolve = useRef<Promise<SolveResult> | null>(null);
  useEffect(() => {
    let active = true;
    sampleSolve.current ??= solvePlan(defaultInputs, []);
    void sampleSolve.current.then(r => {
      if (active && r.ok)
        setProof(r.plan);
    }).catch(() => { }).finally(() => {
      if (active)
        setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);
  const rootRef = useReveal<HTMLDivElement>();
  return (
    <div className="landing" ref={rootRef}>
      <section className="hero">
        <span className="eyebrow">Affordly</span>
        <h1 aria-label={HEADLINE}>
          {HEADLINE.split(' ').map((w, i) => (
            <Fragment key={i}>
              {i > 0 && ' '}
              <span className="hl" aria-hidden="true">
                <span style={{ '--w': i } as CSSProperties}>{w}</span>
              </span>
            </Fragment>
          ))}
        </h1>
        <p className="hero-sub">
          Other planners price your recipes. Affordly prices your receipt:
          the whole packages a store really sells,
          leftovers included.
        </p>
        <div className="hero-buttons">
          <Button
            primary
            size="lg"
            onClick={() => go('inputs')}
          >
            Plan my week
            {' '}
            <Icon name="open" />
          </Button>
          <Button
            size="lg"
            disabled={solving || !ready}
            onClick={() => {
              go('plan');
              void loadSample().catch(() => { });
            }}
          >
            Try with sample
          </Button>
        </div>
        <div className="landing-source"><PriceBadge /></div>
      </section>
      <div className="landing-proof">
        {loading ? <ReceiptSkeleton /> : proof && <HeroReceipt plan={proof} />}
      </div>
      <ProofRow />
      <HowItWorks />
      <DiscoverTeaser />
    </div>
  );
}
