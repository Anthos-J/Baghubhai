import React from 'react';
import { PixelCard } from '../components/ui/PixelCard';
import { GameButton } from '../components/ui/GameButton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Settings, Play, Users } from 'lucide-react';

export default function Lobby() {
  return (
    <div className="min-h-screen flex flex-col p-4 relative text-textMain">
      <header className="flex justify-between items-end w-full z-10 p-4 border-b-4 border-panelBorder bg-panel/80">
        <div>
          <h1 className="font-pixel text-2xl text-white">&lt;<span className="text-primary">CODE</span> MAFIA&gt;</h1>
          <div className="font-mono text-sm text-gray-400 mt-2">
            ROOM: <span className="text-warning font-bold tracking-widest">X7K2P</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-tech text-gray-400 flex items-center gap-2">
            <Users size={16} /> PLAYER COUNT: <span className="text-white">5/10</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center w-full z-10 p-8">
        <PixelCard title="LOBBY TERMINAL" className="w-full max-w-4xl min-h-[500px] flex flex-col">
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 flex-1">
            {/* Example Players */}
            {[
              { name: 'Alex', isHost: true, status: 'online' as const, color: 'text-primary' },
              { name: 'Soham', isHost: false, status: 'online' as const, color: 'text-success' },
              { name: 'Rahul', isHost: false, status: 'online' as const, color: 'text-warning' },
              { name: 'Priya', isHost: false, status: 'online' as const, color: 'text-purple' },
              { name: 'Waiting...', isHost: false, status: 'offline' as const, color: 'text-gray-600' },
            ].map((p, i) => (
              <div key={i} className="border-2 border-panelBorder bg-black p-4 flex flex-col items-center justify-center gap-4 relative">
                {p.isHost && (
                  <div className="absolute top-0 right-0 bg-warning text-black font-pixel text-[8px] px-2 py-1">HOST</div>
                )}
                <div className={`w-16 h-16 border-2 border-current flex items-center justify-center ${p.color}`}>
                  <Users size={32} />
                </div>
                <div className="text-center">
                  <div className="font-tech font-bold text-lg text-white truncate w-full px-2">{p.name}</div>
                  <StatusBadge status={p.status} label={p.status} className="mt-2" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t-2 border-panelBorder flex justify-between items-center">
            <button className="flex items-center gap-2 text-textMuted hover:text-white font-tech transition-colors">
              <Settings size={20} /> GAME SETTINGS
            </button>
            <div className="w-64">
              <GameButton variant="success" icon={<Play size={18} />}>START GAME</GameButton>
            </div>
          </div>
        </PixelCard>
      </main>
    </div>
  );
}
