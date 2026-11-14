import { useEffect, useState } from 'react';

export function SolveStatus() {
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setChecking(true), 3000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <section
      className="card"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p>{checking ? 'Checking what fits your budget\u2026' : 'Pricing your week by the package\u2026'}</p>
      <div className="skeleton" />
      <div className="skeleton" />
    </section>
  );
}
