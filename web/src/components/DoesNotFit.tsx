import './DoesNotFit.css';
import type { SolveResult } from '@affordly/engine';
import { useStore } from '../lib/store';
import { Badge } from './Badge';
import { Button } from './Button';
import { AlternativeCard } from './AlternativeCard';

export function DoesNotFit({ result, go }: {
  result: Extract<SolveResult, {
    ok: false;
  }>;
  go: (tab: string) => void;
}) {
  const { run } = useStore();
  return (
    <section
      className="not-fit"
      role="alert"
    >
      <div>
        <Badge kind="over">Does not fit</Badge>
        <h2>This does not fit your budget.</h2>
        <p className="reason">{result.reason}</p>
        {result.alternatives.length > 0
          &&
          <p>Pick one of these verified options, or change the inputs.</p>
        }
        <Button onClick={() => go('inputs')}>
          Edit inputs
        </Button>
      </div>
      <div className="alternatives reveal-stagger">
        {result.alternatives.length ?
          result.alternatives.map(alt =>
            <AlternativeCard
              key={alt.kind}
              alternative={alt}
              apply={inputs => {
                void run(inputs).then(() => {
                  go('plan');
                  window.scrollTo(0, 0);
                }).catch(() => { });
              }}
            />
          ) :
          <p>Loosen a limit above and try again.</p>
        }
      </div>
    </section>
  );
}
