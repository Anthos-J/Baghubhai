import React from 'react';

type GameShellProps = {
  children: React.ReactNode;
};

export default function GameShell({ children }: GameShellProps) {
  return (
    <div className="h-screen w-screen bg-cm-bg text-white font-tech overflow-hidden selection:bg-cm-accent/30 flex flex-col relative">
      <div className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />
      <div className="flex-1 w-full flex relative z-10">
        {children}
      </div>
    </div>
  );
}
