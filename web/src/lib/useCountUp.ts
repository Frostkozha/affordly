export function useCountUp(targetCents: number, startMs: number, durationMs: number, t: number) {
  const progress = Math.max(0, Math.min(1, (t - startMs) / durationMs));
  return progress === 1 ? targetCents : Math.round(targetCents * (1 - Math.pow(1 - progress, 3)));
}
