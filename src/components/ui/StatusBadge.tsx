import React from 'react';
import { cn } from './PixelCard';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'mafia' | 'developer' | 'eliminated';
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const styles = {
    online: 'text-success bg-success/10 border-success',
    offline: 'text-textMuted bg-gray-800 border-gray-600',
    mafia: 'text-mafia bg-mafia/10 border-mafia',
    developer: 'text-primary bg-primary/10 border-primary',
    eliminated: 'text-purple bg-purple/10 border-purple',
  };

  return (
    <div className={cn(
      "inline-flex items-center px-2 py-1 border-2 font-pixel text-[10px] uppercase tracking-wide",
      styles[status],
      className
    )}>
      <span className={cn(
        "w-2 h-2 mr-2 animate-pulse",
        status === 'offline' || status === 'eliminated' ? 'bg-current' : 'bg-current shadow-[0_0_5px_currentColor]'
      )}></span>
      {label}
    </div>
  );
}
