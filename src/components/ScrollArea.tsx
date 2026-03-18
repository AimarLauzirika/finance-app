import React from 'react';

interface ScrollAreaProps {
  className?: string;
  children: React.ReactNode;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ className = '', children }) => {
  // Tailwind classes for custom scrollbars
  const baseClasses =
    `max-h-[calc(100vh-4rem)] overflow-y-auto 
    [&::-webkit-scrollbar]:w-2 
    [&::-webkit-scrollbar-track]:rounded-none 
    [&::-webkit-scrollbar-track]:bg-gray-100 
    [&::-webkit-scrollbar-thumb]:rounded-none 
    [&::-webkit-scrollbar-thumb]:bg-gray-300 
    dark:[&::-webkit-scrollbar-track]:bg-neutral-700 
    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500`;

  return <div className={`${baseClasses} ${className}`}>{children}</div>;
};
