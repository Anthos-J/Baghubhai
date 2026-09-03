import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PixelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  variant?: 'default' | 'danger' | 'success' | 'highlight';
}

export function PixelCard({ 
  className, 
  title, 
  children, 
  variant = 'default',
  ...props 
}: PixelCardProps) {
  
  const variantStyles = {
    default: 'border-panelBorder',
    danger: 'border-mafia',
    success: 'border-success',
    highlight: 'border-primary',
  };

  return (
    <div className={cn("pixel-panel", variantStyles[variant], className)} {...props}>
      {title && (
        <div className="pixel-panel-header flex justify-between items-center">
          <span>{title}</span>
        </div>
      )}
      <div className="p-4 relative z-10">
        {children}
      </div>
    </div>
  );
}
