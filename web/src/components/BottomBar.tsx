import './AppShell.css';
import { NavLinks } from './NavLinks';

export function BottomBar({ hash }: {
  hash: string;
}) {
  return (
    <nav className="bottom-bar" aria-label="Mobile navigation"><NavLinks hash={hash} /></nav>
  );
}
