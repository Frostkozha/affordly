import { Button } from './Button';
import './AppShell.css';
import { NavLinks } from './NavLinks';

export function TopBar({ hash, ask }: {
  hash: string;
  ask: () => void;
}) {
  return (
    <header className="top-bar">
      <div>
        <a className="wordmark" href="#/">Affordly<span className="wordmark-dot">.</span></a>
        <nav aria-label="Main navigation">
          <NavLinks hash={hash} />
          {hash !== '#/' &&
            <Button onClick={ask}>Ask Affordly</Button>
          }
        </nav>
      </div>
    </header>
  );
}
