import { useEffect, useRef } from 'react';
export function Stepper({ id, label, value, min, max, step = 5, prefix, suffix, onChange }: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latest = useRef(value);
  useEffect(() => { latest.current = value; }, [value]);
  const stop = () => clearTimeout(timer.current);
  useEffect(() => stop, []);
  const move = (direction: number) => {
    onChange(Math.max(min, Math.min(max, (Number.isFinite(latest.current) ? latest.current : min)
      + direction * step)));
  };
  const hold = (direction: number) => {
    stop();
    timer.current = setTimeout(function repeat() {
      move(direction);
      timer.current = setTimeout(repeat, 120);
    }, 400);
  };
  const invalid = !Number.isFinite(value) || value < min || value > max;
  return <div className="stepper" data-invalid={invalid}>
    <button type="button" aria-label={'Decrease ' + label} onClick={() => move(-1)}
      onPointerDown={() => hold(-1)} onPointerUp={stop}
      onPointerCancel={stop} onPointerLeave={stop}>−</button>
    {prefix && <span aria-hidden="true">{prefix}</span>}
    <input id={id} type="number" min={min} max={max} step={step} required
      value={Number.isNaN(value) ? '' : value} aria-invalid={invalid}
      aria-describedby={id + '-hint'} onChange={e => onChange(e.target.valueAsNumber)}
      onBlur={() => onChange(Math.max(min, Math.min(max, Number.isFinite(value) ? value : min)))} />
    {suffix && <span aria-hidden="true">{suffix}</span>}
    <button type="button" aria-label={'Increase ' + label} onClick={() => move(1)}
      onPointerDown={() => hold(1)} onPointerUp={stop}
      onPointerCancel={stop} onPointerLeave={stop}>+</button>
  </div>;
}
