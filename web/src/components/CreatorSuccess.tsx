import { useEffect, useRef } from 'react';
import { Button } from './Button';
import { Icon } from './art/Icons';
export function CreatorSuccess({ reset }: {
  reset: () => void
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  return <section className="card creator-success" role="status">
    <Icon name="check" size={28} /><h2 ref={heading} tabIndex={-1}>Application sent.</h2>
    <p>We review applications by hand. We will contact you on the handle you gave.
      We aim to reply within 7 days.</p>
    <a className="btn" href="#/discover">Back to Discover</a>
    <Button quiet onClick={reset}>Send another</Button>
  </section>;
}
