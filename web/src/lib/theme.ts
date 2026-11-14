export type Theme = 'light' | 'dark';

const KEY = 'affordly-theme';
const dark = '(prefers-color-scheme: dark)';

export function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === 'light' || chosen === 'dark')
    return chosen;
  return matchMedia(dark).matches ? 'dark' : 'light';
}

/** Point the browser chrome colour at the paper of the active theme. */
export function syncThemeColor() {
  const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', paper);
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add('theme-fade');
  root.dataset.theme = theme;
  syncThemeColor();
  setTimeout(() => root.classList.remove('theme-fade'), 250);
  try {
    localStorage.setItem(KEY, theme);
  } catch { /* The choice just will not persist. */ }
}

/** Calls back when the device setting flips, which matters only while no choice is stored. */
export function watchDeviceTheme(onChange: () => void) {
  const query = matchMedia(dark);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
