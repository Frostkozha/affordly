import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { useReducedMotion } from './useReducedMotion';
export function useSwipe(onDecision: (like: boolean) => void) {
  const reduced = useReducedMotion();
  const element = useRef<HTMLDivElement | null>(null);
  const start = useRef<{
    x: number;
    y: number;
    lastX: number;
    lastT: number;
    velocity: number;
    horizontal: boolean;
  } | null>(null);
  const frame = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [leaving, setLeaving] = useState(false);
  const [stamp, setStamp] = useState<boolean | null>(null);
  useEffect(() => () => {
    cancelAnimationFrame(frame.current);
    clearTimeout(timer.current);
  }, []);
  const reset = () => {
    if (element.current) {
      element.current.style.transform = '';
      element.current.style.transition = '';
      element.current.style.setProperty('--drag-like', '0');
      element.current.style.setProperty('--drag-nope', '0');
    }
    start.current = null;
  };
  const commit = (like: boolean) => {
    if (leaving)
      return;
    setLeaving(true);
    setStamp(like);
    if (element.current && !reduced) {
      element.current.style.transition = 'transform 420ms var(--ease-in)';
      element.current.style.transform = 'translateX(' + (like ? 1 : -1) * (innerWidth + 200)
        + 'px) rotate(' + (like ? 24 : -24) + 'deg)';
    }
    timer.current = setTimeout(() => {
      onDecision(like);
      reset();
      setLeaving(false);
      setStamp(null);
    }, reduced ? 400 : 420);
  };
  const down = (event: PointerEvent<HTMLElement>) => {
    if (reduced || leaving || (event.target as HTMLElement).closest('button'))
      return;
    start.current = { x: event.clientX, y: event.clientY, lastX: event.clientX,
      lastT: performance.now(), velocity: 0, horizontal: false };
  };
  const move = (event: PointerEvent<HTMLElement>) => {
    const origin = start.current;
    if (!origin || leaving)
      return;
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (!origin.horizontal) {
      if (Math.hypot(dx, dy) < 8)
        return;
      if (Math.abs(dy) > Math.abs(dx)) {
        reset();
        return;
      }
      origin.horizontal = true;
    }
    const now = performance.now();
    origin.velocity = (event.clientX - origin.lastX) / Math.max(1, now - origin.lastT);
    origin.lastX = event.clientX;
    origin.lastT = now;
    event.currentTarget.setPointerCapture(event.pointerId);
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (!element.current)
        return;
      element.current.style.transition = 'none';
      element.current.style.transform = 'translate(' + dx + 'px,' + dy * .3 + 'px) rotate('
        + Math.max(-14, Math.min(14, dx / 20)) + 'deg)';
      element.current.style.setProperty('--drag-like', String(Math.max(0, Math.min(1, dx / 96))));
      element.current.style.setProperty('--drag-nope', String(Math.max(0, Math.min(1, -dx / 96))));
    });
  };
  const up = (event: PointerEvent<HTMLElement>) => {
    const origin = start.current;
    if (!origin || leaving)
      return;
    cancelAnimationFrame(frame.current);
    const dx = event.clientX - origin.x;
    const velocity = performance.now() - origin.lastT < 80 ? origin.velocity : 0;
    start.current = null;
    if (Math.abs(dx) >= 96 || (Math.abs(velocity) >= .5 && velocity * dx > 0))
      commit(dx > 0);
    else
      if (element.current) {
        element.current.style.transition = 'transform 420ms var(--ease-snap)';
        element.current.style.transform = '';
        element.current.style.setProperty('--drag-like', '0');
        element.current.style.setProperty('--drag-nope', '0');
      }
  };
  return {
    element, commit, leaving, stamp, reduced,
    handlers: { onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: reset }
  };
}
