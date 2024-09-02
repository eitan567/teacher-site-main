import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemedCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`relative -mx-4 ${theme.background} px-5 pb-10 shadow-lg sm:mx-0 sm:rounded-3xl sm:px-10 ${className}`}>
      <div className={`relative -mx-5 mt-8 flex flex-col px-5 sm:mx-0 sm:rounded-2xl`}>
        {children}
      </div>
    </div>
  );
};