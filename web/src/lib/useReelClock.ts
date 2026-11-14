import { useEffect, useState } from 'react';
export function useReelClock(duration: number, running: boolean, loop = true) {
  const [t, setTime] = useState(0);
  useEffect(() => {
    if (!running)
      return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      if (!document.hidden)
        setTime(previous => {
          const next = previous + delta;
          return next > duration + 400 && loop ? 0 : Math.min(next, duration + 400);
        });
      frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      last = performance.now();
    };
    document.addEventListener('visibilitychange', visibility);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [duration, running, loop]);
  return { t, p: Math.min(1, t / duration), restart: () => setTime(0) };
}
