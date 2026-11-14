import { JudgeGuide } from './JudgeGuide';
import './JudgeGuide.css';
import './Landing.css';
import { useEffect, useRef, useState } from 'react';
import type { Plan, SolveResult } from '@affordly/engine';
import { solvePlan } from '../lib/engine';
import { defaultInputs } from '../lib/config';
import { useStore } from '../lib/store';
import { Button } from './Button';
import { Money } from './Money';
import { PriceSourceLine } from './PriceSourceLine';
import { Skeleton } from './Skeleton';

export function Landing({ go }: {
  go: (tab: string) => void;
}) {
  const { useSample, solving, ready } = useStore();
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
  return (
    <div className="landing">
      <section className="hero">
        <span className="eyebrow">Affordly</span>
        <h1>Plan the week you can actually afford.</h1>
        <p className="hero-sub">
          Other planners price your recipes. Affordly prices your receipt:
          the whole packages a store really sells,
          leftovers included.
        </p>
        <div className="hero-buttons">
          <Button
            primary
            onClick={() => go('inputs')}
          >
            Plan my week
            {' '}
            <span aria-hidden="true">↗</span>
          </Button>
          <Button
            disabled={solving || !ready}
            onClick={() => {
              go('plan');
              void useSample().catch(() => { });
            }}
          >
            Try with sample
          </Button>
        </div>
        <div className="landing-source"><PriceSourceLine /></div>
      </section>
      <div className="landing-proof">
        {loading ?
          <Skeleton />
          :
          proof
          &&
          <section className="card proof">
            <div className="receipt-heading">
              <span className="eyebrow">One week. Two prices.</span>
              <span className="meta">SAMPLE RECEIPT</span>
            </div>
            <div className="proof-figure">
              <span>Recipe price</span>
              <Money value={proof.gramCost} big />
            </div>
            <div className="proof-figure">
              <span>Receipt price</span>
              <Money value={proof.basketCost} big />
            </div>
            <div className="proof-gap">
              <span>Checkout Gap</span>
              <Money value={proof.checkoutGap} gap />
            </div>
            <p>
              Same week, same food. The
              {' '}
              <Money value={proof.checkoutGap} />
              {' '}
              gap is packages you cannot half-buy.
            </p>
            <div className="receipt-end" aria-hidden="true">|||| ||| ||||| || |||| ||| |||||| ||</div>
          </section>
        }
        <JudgeGuide />
        <div className="mobile-only"><PriceSourceLine /></div>
      </div>
    </div>
  );
}
