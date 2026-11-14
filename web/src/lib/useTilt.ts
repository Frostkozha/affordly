import { useEffect, useRef } from 'react';
/**
 * Pointer tilt for a hovered element. Writes --nx/--ny (-1..1) and --px/--py (%)
 * and sets data-tilt="on" while the pointer is over it. Fine pointers only,
 * and never with reduced motion.
 */
export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches)
      return;
    let raf = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      if (!last)
        return;
      const r = el.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (last.clientX - r.left) / r.width));
      const y = Math.min(1, Math.max(0, (last.clientY - r.top) / r.height));
      el.style.setProperty('--nx', String(x * 2 - 1));
      el.style.setProperty('--ny', String(y * 2 - 1));
      el.style.setProperty('--px', x * 100 + '%');
      el.style.setProperty('--py', y * 100 + '%');
    };
    const move = (e: PointerEvent) => {
      last = e;
      el.dataset.tilt = 'on';
      raf ||= requestAnimationFrame(apply);
    };
    const leave = () => {
      last = null;
      cancelAnimationFrame(raf);
      raf = 0;
      delete el.dataset.tilt;
      for (const v of ['--nx', '--ny', '--px', '--py'])
        el.style.removeProperty(v);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);
  return ref;
}
