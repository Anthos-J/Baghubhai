import React from 'react';
import { PixelCard } from '../components/ui/PixelCard';
import { GameButton } from '../components/ui/GameButton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AlertTriangle, ThumbsUp, UserX } from 'lucide-react';

export default function Meeting() {
  return (
    <div className="min-h-screen flex flex-col p-4 relative text-textMain z-10 items-center justify-center">
      <div className="absolute inset-0 bg-black/80 z-0"></div>
      
      <div className="z-10 text-center mb-8">
        <h1 className="font-pixel text-4xl text-warning drop-shadow-[0_0_15px_#FFB800] flex items-center justify-center gap-4">
          <AlertTriangle size={40} />
          EMERGENCY MEETING
          <AlertTriangle size={40} />
        </h1>
        <p className="font-tech mt-2 text-xl text-gray-300">DISCUSS AND VOTE</p>
        <div className="mt-4 font-mono text-primary text-2xl animate-pulse">01:15</div>
      </div>

      <PixelCard className="w-full max-w-5xl z-10 bg-panel/90">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          {/* Player Cards for Voting */}
          {[
            { name: 'Alex_Dev', status: 'alive' },
            { name: 'Soham', status: 'eliminated' },
            { name: 'Rahul', status: 'alive' },
            { name: 'Priya', status: 'alive' },
          ].map((p, i) => (
            <div key={i} className={`border-4 p-4 flex flex-col items-center gap-3 transition-transform ${p.status === 'eliminated' ? 'border-gray-800 opacity-50 grayscale' : 'border-panelBorder hover:border-primary cursor-pointer hover:-translate-y-1'}`}>
              <div className="w-16 h-16 bg-black border-2 border-gray-600 flex items-center justify-center">
                {p.status === 'eliminated' ? <UserX size={32} className="text-mafia" /> : <div className="text-3xl">🤖</div>}
              </div>
              <div className="font-tech font-bold text-center w-full truncate">{p.name}</div>
              {p.status === 'alive' ? (
                <GameButton variant="primary" className="w-full py-1 text-xs">VOTE</GameButton>
              ) : (
                <StatusBadge status="eliminated" label="ELIMINATED" />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-8 border-t-4 border-panelBorder pt-4 flex justify-between">
          <GameButton variant="ghost">SKIP VOTE</GameButton>
          <div className="font-mono text-sm text-gray-500 mt-2">VOTES CAST: 3/4</div>
        </div>
      </PixelCard>
    </div>
  );
}
