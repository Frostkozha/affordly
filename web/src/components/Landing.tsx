import './JudgeGuide.css';
import './Landing.css';
import { useEffect, useState } from 'react';
import type { Plan } from '@affordly/engine';
import { solvePlan } from '../lib/engine';
import { defaultInputs } from '../lib/config';
import { useStore } from '../lib/store';
import { Button, Money, PriceSourceLine, Skeleton } from './shared';
export function JudgeGuide() { return <section className="card judge-guide"><span className="eyebrow">Take a closer look</span><h2>Judge guide, 2 minutes</h2><ol><li>Tap "Try with sample" and look at the Checkout Gap.</li><li>Set the budget to $40 and see what does not fit, and the options.</li><li>Open "Week 2", tap "Simulate next week", then "Unlock demo".</li></ol></section>; }
export function Landing({ go }: { go: (tab: string) => void }) {
  const { useSample } = useStore(); const [proof, setProof] = useState<Plan | null>(null), [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; void solvePlan(defaultInputs, []).then(r => { if (active && r.ok) setProof(r.plan); }).catch(() => {}).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  return <div className="landing"><section className="hero"><span className="eyebrow">Affordly</span><h1>Plan the week you can actually afford.</h1><p className="hero-sub">Other planners price your recipes. Affordly prices your receipt: the whole packages a store really sells, leftovers included.</p><div className="hero-buttons"><Button primary onClick={() => go('inputs')}>Plan my week <span aria-hidden="true">↗</span></Button><Button onClick={() => { void useSample().then(() => go('plan')); }}>Try with sample</Button></div><div className="landing-source"><PriceSourceLine /></div></section><div className="landing-proof">{loading ? <Skeleton /> : proof && <section className="card proof"><div className="receipt-heading"><span className="eyebrow">One week. Two prices.</span><span className="meta">SAMPLE RECEIPT</span></div><div className="proof-figure"><span>Recipe price</span><Money value={proof.gramCost} big /></div><div className="proof-figure"><span>Receipt price</span><Money value={proof.basketCost} big /></div><div className="proof-gap"><span>Checkout Gap</span><Money value={proof.checkoutGap} gap /></div><p>Same week, same food. The <Money value={proof.checkoutGap} /> gap is packages you cannot half-buy.</p><div className="receipt-end" aria-hidden="true">|||| ||| ||||| || |||| ||| |||||| ||</div></section>}<JudgeGuide /><div className="mobile-only"><PriceSourceLine /></div></div></div>;
}
