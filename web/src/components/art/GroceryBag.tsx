export function GroceryBag({ size = 96, draw = false }: {
  size?: number;
  draw?: boolean
}) {
  return <svg width={size} height={size} viewBox="0 0 96 96" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    className={draw ? 'bag-draw' : undefined}>
    <path pathLength="1" d="M20 34H76L72 84Q72 88 68 88H28Q24 88 24 84Z" />
    <path pathLength="1" d="M36 34V28a12 12 0 0 1 24 0V34M40 34 34 12h4l6 22" />
    <path pathLength="1" d="M58 34C56 24 62 18 70 16C70 24 66 31 58 34Z" />
    <path pathLength="1" d="M50 34V22H64V34M53 27H61M53 31H61M24 46H72" />
  </svg>;
}
