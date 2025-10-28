
import { useState, useEffect } from 'react';

export function useDarkMode(): [string, () => void] {
  const [theme, setTheme] = useState<string>(localStorage.getItem('theme') || 'light');

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return [theme, toggleTheme];
}
