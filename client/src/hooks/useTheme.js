import { useEffect } from 'react';

export const useTheme = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return { theme: 'dark', isDark: true, toggleTheme: () => {} };
};
