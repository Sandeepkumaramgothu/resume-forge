'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('rf-theme');
    if (stored === 'light') {
      setIsDark(false);
      document.documentElement.classList.add('light');
    }
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.remove('light');
        localStorage.setItem('rf-theme', 'dark');
      } else {
        document.documentElement.classList.add('light');
        localStorage.setItem('rf-theme', 'light');
      }
      return next;
    });
  };

  return (
    <button
      onClick={toggle}
      className="btn-ghost rounded-lg"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      id="theme-toggle"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
