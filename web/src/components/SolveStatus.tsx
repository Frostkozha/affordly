import { useEffect, useState } from 'react';
import { ReceiptSkeleton } from './ReceiptSkeleton';
export function SolveStatus() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, []);
  return <div className="solving-receipt">
    <span className="num">AFFORDLY</span>
    <ReceiptSkeleton />
    {slow && <p role="status">Still working. This can take a moment on a slow connection.</p>}
  </div>;
}
