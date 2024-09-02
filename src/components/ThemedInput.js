import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemedInput = ({ className = '', ...props }) => {
  const { theme } = useTheme();
  
  return (
    <input 
      className={`${theme.input} ${theme.inputTextColor} ${theme.inputBorder} text-base w-full px-3 py-2 rounded-lg ${className} ${theme.inputPlaceholder}`}
      {...props}
    />
  );
};