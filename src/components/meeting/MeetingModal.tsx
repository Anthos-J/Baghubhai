import React from 'react';
import { PixelCard } from '../ui/PixelCard';
import { GameButton } from '../ui/GameButton';
import { StatusBadge } from '../ui/StatusBadge';
import { AlertTriangle, UserX, Users } from 'lucide-react';
import { usePlayers } from '../../hooks/usePlayers';
import { resolvePlayerColor, getPlayerAvatarUrl } from '../../map/SpriteManager';

export default function MeetingModal() {
  const { players } = usePlayers();

  return (
    <div className="absolute inset-0 flex flex-col p-4 z-50 items-center justify-center">
      <div className="absolute inset-0 bg-black/80 z-0 backdrop-blur-sm"></div>
      
      <div className="z-10 text-center mb-8">
        <h1 className="font-pixel text-4xl text-warning drop-shadow-[0_0_15px_#FFB800] flex items-center justify-center gap-4">
          <AlertTriangle size={40} className="animate-pulse" />
          EMERGENCY MEETING
          <AlertTriangle size={40} className="animate-pulse" />
        </h1>
        <p className="font-tech mt-2 text-xl text-gray-300">DISCUSS AND VOTE</p>
        <div className="mt-4 font-mono text-primary text-2xl animate-pulse">01:15</div>
      </div>

      <PixelCard className="w-full max-w-5xl z-10 bg-panel/90">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
          {players.map((p) => (
            <div key={p.id} className={`border-4 p-4 flex flex-col items-center gap-3 transition-transform ${!p.alive ? 'border-gray-800 opacity-50 grayscale' : 'border-panelBorder hover:border-primary cursor-pointer hover:-translate-y-1'}`}>
              <div className="w-20 h-24 bg-black border-2 border-gray-600 flex items-center justify-center overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)]" style={{ color: p.alive ? p.color : '#555' }}>
                <img 
                  src={getPlayerAvatarUrl(p.color)} 
                  alt={p.username} 
                  className={`w-full h-full object-cover object-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${!p.alive ? 'opacity-40 grayscale' : ''}`}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="font-tech font-bold text-center w-full truncate">{p.username}</div>
              {p.alive ? (
                <GameButton variant="primary" className="w-full py-1 text-xs">VOTE</GameButton>
              ) : (
                <StatusBadge status="offline" label="ELIMINATED" />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-8 border-t-4 border-panelBorder pt-4 flex justify-between">
          <GameButton variant="ghost">SKIP VOTE</GameButton>
          <div className="font-mono text-sm text-gray-500 mt-2">VOTES CAST: 0/{players.filter(p => p.alive).length}</div>
        </div>
      </PixelCard>
    </div>
  );
}
