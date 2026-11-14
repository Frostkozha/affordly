import './AppShell.css';
const links = [
  {
    name: 'Plan',
    href: '#/plan#plan'
  },
  {
    name: 'Basket',
    href: '#/plan#basket'
  },
  {
    name: 'Week 2',
    href: '#/week2'
  },
  {
    name: 'Account',
    href: '#/account'
  }
];

export function NavLinks({ hash }: {
  hash: string;
}) {
  return (
    <>
      {links.map(link =>
        <a
          key={link.name}
          href={link.href}
          aria-current={(link.name === 'Plan' ?
            hash.startsWith('#/plan') && !hash.endsWith('#basket') :
            hash === link.href) ?
            'page' :
            undefined}
        >
          {link.name}
        </a>
      )}
    </>
  );
}
