import { useEffect, useState } from 'react';
import { currentTheme, setTheme, syncThemeColor, watchDeviceTheme } from '../lib/theme';
import { Icon } from './art/Icons';

export function ThemeToggle() {
  const [theme, setCurrent] = useState(currentTheme);
  useEffect(() => {
    syncThemeColor();
    return watchDeviceTheme(() => {
      syncThemeColor();
      setCurrent(currentTheme());
    });
  }, []);
  const dark = theme === 'dark';
  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    setTheme(next);
    setCurrent(next);
  };
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <Icon name={dark ? 'sun' : 'moon'} />
    </button>
  );
}
