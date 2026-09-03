import React from 'react';
import { PixelCard } from '../components/ui/PixelCard';
import { GameButton } from '../components/ui/GameButton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Settings, Play, Users } from 'lucide-react';
import { usePlayers } from '../hooks/usePlayers';
import { useRoom } from '../hooks/useRoom';
import { useGame } from '../hooks/useGame';

export default function Lobby() {
  const { players, localPlayer } = usePlayers();
  const { roomId, isHost } = useRoom();
  const { startGame } = useGame();

  return (
    <div className="w-full max-w-5xl flex flex-col p-4 relative text-textMain">
      <header className="flex justify-between items-end w-full z-10 p-4 border-b-4 border-panelBorder bg-panel/80">
        <div>
          <h1 className="font-pixel text-2xl text-white">&lt;<span className="text-[#0066FF]">AMONG</span> <span className="text-mafia">DEVS</span>&gt;</h1>
          <div className="font-mono text-sm text-gray-400 mt-2">
            ROOM: <span className="text-warning font-bold tracking-widest">{roomId || 'X7K2P'}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-tech text-gray-400 flex items-center gap-2">
            <Users size={16} /> PLAYER COUNT: <span className="text-white">{players.length}/10</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center w-full z-10 p-4 md:p-8">
        <PixelCard title="LOBBY TERMINAL" className="w-full min-h-[500px] flex flex-col">
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 flex-1">
            {players.map((p) => {
              const playerIsHost = p.id === players[0]?.id;
              const isLocal = p.id === localPlayer?.id;
              
              return (
                <div key={p.id} className={`border-2 ${isLocal ? 'border-primary' : 'border-panelBorder'} bg-black p-4 flex flex-col items-center justify-center gap-4 relative`}>
                  {playerIsHost && (
                    <div className="absolute top-0 right-0 bg-warning text-black font-pixel text-[8px] px-2 py-1">HOST</div>
                  )}
                  {isLocal && (
                    <div className="absolute top-0 left-0 bg-primary text-black font-pixel text-[8px] px-2 py-1">YOU</div>
                  )}
                  <div className="w-16 h-16 border-2 border-current flex items-center justify-center" style={{ color: p.color }}>
                    <Users size={32} />
                  </div>
                  <div className="text-center w-full">
                    <div className="font-tech font-bold text-lg text-white truncate w-full px-2">{p.username}</div>
                    <StatusBadge status={p.connected ? 'online' : 'offline'} label={p.connected ? 'online' : 'offline'} className="mt-2 mx-auto" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t-2 border-panelBorder flex justify-between items-center">
            <button className="flex items-center gap-2 text-textMuted hover:text-white font-tech transition-colors">
              <Settings size={20} /> GAME SETTINGS
            </button>
            <div className="w-64">
              {isHost ? (
                <GameButton variant="success" icon={<Play size={18} />} onClick={startGame}>START GAME</GameButton>
              ) : (
                <div className="text-center font-tech text-gray-500 bg-[#1a1c23] p-3 border-2 border-panelBorder">
                  WAITING FOR HOST...
                </div>
              )}
            </div>
          </div>
        </PixelCard>
      </main>
    </div>
  );
}
