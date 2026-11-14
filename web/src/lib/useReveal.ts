import { useLayoutEffect, useRef } from 'react';
/**
 * Scroll reveal: adds "reveal-ready" to the root (which hides [data-reveal]
 * children) and "is-in" to each one once it scrolls into view. Without JS,
 * IntersectionObserver or with reduced motion nothing is hidden.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === 'undefined'
      || matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting)
          continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }, { threshold: 0.15 });
    const scan = () => root.querySelectorAll('[data-reveal]:not(.is-in)').forEach(n => io.observe(n));
    scan();
    root.classList.add('reveal-ready');
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove('reveal-ready');
    };
  }, []);
  return ref;
}
