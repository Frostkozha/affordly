import { useEffect, useState } from 'react';
import { Icon } from './art/Icons';
const links = [
  { name: 'Plan', href: '#/plan', icon: 'plan' },
  { name: 'Discover', href: '#/discover', icon: 'discover' },
  { name: 'Account', href: '#/account', icon: 'account' },
] as const;
export function NavLinks({ hash }: {
  hash: string
}) {
  const [seen, setSeen] = useState(() => {
    try {
      return Boolean(localStorage.getItem('affordly.discoverSeen'));
    } catch {
      return false;
    }
  });
  useEffect(() => {
    let visited = location.hash.startsWith('#/discover');
    const persist = () => {
      try { localStorage.setItem('affordly.discoverSeen', '1'); }
      catch { /* Optional visit marker. */ }
    };
    if (visited) persist();
    const visit = () => {
      visited = visited || location.hash.startsWith('#/discover');
      if (visited) {
        persist();
        setSeen(true);
      }
    };
    window.addEventListener('hashchange', visit);
    return () => window.removeEventListener('hashchange', visit);
  }, []);
  return <>{links.map(link => {
    const active = link.name === 'Plan' ?
      /^#\/(plan|next-week|week2)/.test(hash) : hash.startsWith(link.href);
    return <a key={link.name} href={link.href} aria-current={active ? 'page' : undefined}>
      <span className="nav-icon"><Icon name={link.icon} />
        {link.name === 'Discover' && !seen && !hash.startsWith('#/discover') && <i className="unseen-dot" />}</span>
      <span>{link.name}</span>
    </a>;
  })}</>;
}
