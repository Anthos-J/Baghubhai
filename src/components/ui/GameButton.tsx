import React from 'react';
import { cn } from './PixelCard'; // reusing cn

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'purple' | 'ghost';
  icon?: React.ReactNode;
}

export function GameButton({ 
  className, 
  variant = 'primary', 
  icon,
  children, 
  ...props 
}: GameButtonProps) {
  
  const variantStyles = {
    primary: 'btn-primary',
    success: 'btn-success',
    danger: 'btn-mafia',
    warning: 'btn-warning',
    purple: 'btn-purple',
    ghost: 'btn-ghost'
  };

  return (
    <button 
      className={cn("game-button w-full", variantStyles[variant], className)} 
      {...props}
    >
      {children}
      {icon && <span className="ml-2 inline-flex items-center">{icon}</span>}
    </button>
  );
}
