import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemedCard = ({ children, className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`relative ${theme.background} ${theme.border} w-full px-5 pb-10 shadow-lg sm:rounded-3xl sm:px-4 ${className} ${theme.backgroundImg}`}>
      {/* <div class="flex justify-center absolute -bottom-px mx-auto h-[2px] w-full right-[-10px]">
        <div class="-ml-[-20px] w-full flex-none blur-sm [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
        <div class="-ml-[-20px] w-full flex-none blur-[1px] [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
        <div class="-ml-[-20px] w-full flex-none blur-sm [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
        <div class="-ml-[-20px] w-full flex-none blur-[1px] [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
      </div> */}
      <div className={`relative mt-8 flex flex-col px-5 sm:mx-0 sm:rounded-2xl`}>
        {children}
      </div>
    </div>
  );
};