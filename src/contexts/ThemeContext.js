// src/contexts/ThemeContext.js
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const themes = {
  dark: {
    name: 'dark',
    background: 'bg-[radial-gradient(164.75%_100%_at_50%_0%,#334155_0%,#0F172A_48.73%)]',
    cardBg: 'bg-slate-700/25',
    text: 'text-white',
    titleText: 'text-white',
    textSecondary: 'text-slate-400',
    button: 'bg-slate-600 hover:bg-slate-500',
    input: 'bg-slate-600',
    border: 'ring-1 ring-slate-700/50',
  },
  light: {
    name: 'light',
    background: 'bg-[radial-gradient(164.75%_100%_at_50%_0%,#E2E8F0_0%,#CBD5E1_48.73%)]',
    cardBg: 'bg-white/90',
    text: 'text-white',
    titleText: 'text-gray-800',
    textSecondary: 'text-gray-600',
    button: 'bg-blue-500 hover:bg-blue-600',
    input: 'bg-gray-300',
    border: 'ring-1 ring-gray-200',
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.dark);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme.name === 'dark' ? themes.light : themes.dark);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};