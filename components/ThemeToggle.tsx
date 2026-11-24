'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const current = (): Theme => {
  const set = document.documentElement.dataset.theme as Theme | undefined;
  if (set) return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);
  useEffect(() => setTheme(current()), []);

  function toggle() {
    const next: Theme = current() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {}
    setTheme(next);
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'} title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}>
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}

