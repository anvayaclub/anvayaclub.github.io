import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-xl transition-all duration-200 text-plum-700 dark:text-ivory-200 hover:bg-gold-500/15 border border-ivory-300/60 dark:border-plum-700/60 focus:outline-none focus:ring-2 focus:ring-gold-500/40 ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-gold-400 hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="w-4 h-4 text-plum-800 hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
};
