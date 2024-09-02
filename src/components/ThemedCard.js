import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemedCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`relative ${theme.background} ${theme.border} w-full px-5 pb-10 shadow-lg mx-2 sm:rounded-3xl sm:px-4 ${className}`}>
      <div className={`relative mt-8 flex flex-col px-5 sm:mx-0 sm:rounded-2xl`}>
        {children}
      </div>
    </div>
  );
};