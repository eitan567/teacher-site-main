import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemedButton = ({ children, className = '', ...props }) => {
  const { theme } = useTheme();
  
  return (
    <button 
      className={`${theme.button} ${theme.buttonTextColor} text-base font-semibold py-2 px-3 rounded-lg ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};