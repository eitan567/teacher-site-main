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
    buttonTextColor: 'text-white',
    input: 'bg-slate-600',
    inputTextColor: 'text-white',
    inputPlaceholder: '',
    inputBorder : 'ring-1 ring-slate-700/50',
    border: 'ring-1 ring-slate-700/50',
  },
  light: {
    name: 'light',
    background: 'bg-[radial-gradient(164.75%_100%_at_50%_0%,#762fb6_0%,#173c6e_48.73%)]',
    cardBg: 'bg-white/90',
    text: 'text-white',
    titleText: 'text-white',
    textSecondary: 'text-white',
    button: 'bg-[#8600e6] hover:bg-[#7300c6]',
    buttonTextColor: 'text-black',
    input: 'bg-gray-300',
    inputTextColor: 'text-black',
    inputPlaceholder: 'placeholder-gray-500',
    inputBorder : 'ring-1 ring-gray-200',
    border: 'ring-1 ring-gray-200',
  },
  light2: {
    name: 'light2',
    background: 'bg-white',
    cardBg: 'bg-white',
    text: 'text-slate-900',
    titleText: 'text-slate-900',
    textSecondary: 'text-slate-500',
    button: 'bg-slate-900 hover:bg-slate-700',
    buttonTextColor: 'text-white',
    input: 'bg-slate-50',
    inputTextColor: 'text-slate-900',
    inputPlaceholder: 'placeholder-slate-400',
    inputBorder : 'ring-1 ring-slate-900/20',
    border: 'ring-1 ring-slate-900/10',
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.dark);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme.name === 'dark' ? themes.light2 : themes.dark);
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