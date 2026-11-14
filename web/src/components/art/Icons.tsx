const paths = {
  pause: 'M9 5v14M15 5v14',
  plan: 'M5 3h14v18l-3-2-4 2-4-2-3 2V3Zm3 5h8M8 12h8M8 16h5',
  basket: 'M4 8h16l-2 13H6L4 8Zm4 0V6a4 4 0 0 1 8 0v2',
  discover: 'm4 5 13-2 3 17-13 2L4 5Zm-2 3 1 13',
  week: 'M4 5h16v15H4V5Zm0 5h16M8 3v4m8-4v4M8 14h3',
  account: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0',
  heart: 'M12 20 3 11C-2 3 8 0 12 6c4-6 14-3 9 5l-9 9Z',
  close: 'm5 5 14 14M5 19 19 5',
  undo: 'M8 4 3 9l5 5M3 9h10a6 6 0 0 1 0 12',
  check: 'm4 12 5 5L20 6',
  pin: 'M12 22S4 14 4 9a8 8 0 0 1 16 0c0 5-8 13-8 13Zm0-10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  share: 'M12 16V2m-5 5 5-5 5 5M5 12H3v10h18V12h-2',
  open: 'M5 19 19 5M5 5h14v14',
  box: 'm3 7 9-5 9 5v12l-9 4-9-4V7Zm0 0 9 5 9-5M12 12v11',
  no: 'M5 5 19 19M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  tag: 'M2 3h10l10 10-9 9L2 11V3Zm5 4h.01',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z',
};
export function Icon({ name, size = 20 }: {
  name: keyof typeof paths;
  size?: number
}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={paths[name]} />
  </svg>;
}
