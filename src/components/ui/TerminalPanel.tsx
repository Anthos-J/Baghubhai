import React from 'react';
import { cn } from './PixelCard';

export function TerminalPanel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "bg-[#050810] border-2 border-[#1a233a] p-4 font-mono text-sm overflow-hidden relative", 
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(0,240,255,0.02)] pointer-events-none"></div>
      <div className="relative z-10 text-primary">
        {children}
      </div>
    </div>
  );
}
