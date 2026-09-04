import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockStore } from '../store/mockStore';
import { leaveRoom } from '../lib/roomService';
import { getPlayerAvatarUrl } from '../map/SpriteManager';
import { 
  Trophy, 
  Skull, 
  RotateCcw, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Users, 
  Flame, 
  ShieldCheck,
  Code2
} from 'lucide-react';

interface ResultProps {
  winner?: 'developers' | 'mafia' | string;
  reason?: string;
}

export default function Result({ winner = 'developers', reason }: ResultProps) {
  const navigate = useNavigate();
  const storeWinner = useMockStore((s) => s.engineState.winner?.winner);
  const storeReason = useMockStore((s) => s.engineState.winner?.reason);
  const players = useMockStore((s) => s.players);
  const session = useMockStore((s) => s.session);
  const totalTasksCompleted = useMockStore((s) => s.totalTasksCompleted);
  const totalGameTasks = useMockStore((s) => s.totalGameTasks);
  const assignedCodeProject = useMockStore((s) => s.assignedCodeProject);
  const playAgain = useMockStore((s) => s.playAgain);
  const clearRoom = useMockStore((s) => s.clearRoom);

  // Normalize winner identity
  const activeWinnerStr = (storeWinner || winner || 'developers').toLowerCase();
  const isMafiaWinner = activeWinnerStr === 'mafia';
  const isDevsWinner = !isMafiaWinner;

  // Active message / reason
  const displayReason = storeReason || reason || (
    isMafiaWinner
      ? 'Sprint deadline reached! The crewmates ran out of time to fix the codebase.'
      : 'All tasks completed! All bugs were fixed. Deployment successful.'
  );

  // Local player
  const localPlayer = players.find((p) => p.id === session?.playerId);
  const isHost = session?.isHost ?? false;

  const handlePlayAgainClick = () => {
    playAgain();
  };

  const handleReturnToMenuClick = async () => {
    try {
      await leaveRoom();
    } catch (err) {
      console.warn('Error leaving room:', err);
    }
    clearRoom();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-black text-textMain overflow-y-auto select-none">
      {/* Scanline and Cyber Glow Background */}
      <div className="absolute inset-0 scanlines opacity-40 pointer-events-none z-0" />
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[700px] sm:h-[900px] rounded-full blur-[180px] opacity-25 pointer-events-none transition-all duration-1000 ${
          isMafiaWinner ? 'bg-[#FF003C]' : 'bg-[#00F0FF]'
        }`} 
      />

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center my-auto py-6">
        
        {/* Victory Icon Badge */}
        <div className="mb-4 relative">
          <div 
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center border-4 shadow-2xl transition-transform hover:scale-105 ${
              isMafiaWinner 
                ? 'bg-[#FF003C]/20 border-[#FF003C] text-[#FF003C] shadow-[0_0_50px_rgba(255,0,60,0.6)]' 
                : 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_50px_rgba(0,240,255,0.6)]'
            }`}
          >
            {isMafiaWinner ? (
              <Skull size={44} className="animate-bounce" />
            ) : (
              <Trophy size={44} className="animate-bounce" />
            )}
          </div>
        </div>

        {/* Status Header */}
        <div className="font-tech text-xs sm:text-sm tracking-[0.4em] uppercase text-gray-400 mb-2 flex items-center gap-2">
          {isMafiaWinner ? (
            <>
              <Flame size={14} className="text-[#FF003C] animate-pulse" />
              <span>DEADLINE EXPIRED • DEPLOYMENT FAILED</span>
            </>
          ) : (
            <>
              <ShieldCheck size={14} className="text-success animate-pulse" />
              <span>SYSTEM RESTORED • MISSION ACCOMPLISHED</span>
            </>
          )}
        </div>

        {/* Main Winner Title */}
        <h1 
          className={`font-pixel text-5xl sm:text-7xl md:text-8xl tracking-wider leading-none mb-3 drop-shadow-2xl ${
            isMafiaWinner 
              ? 'text-[#FF003C] drop-shadow-[0_0_35px_#FF003C]' 
              : 'text-[#00F0FF] drop-shadow-[0_0_35px_#00F0FF]'
          }`}
        >
          {isMafiaWinner ? 'MAFIA WON!' : 'DEVS WON!'}
        </h1>

        {/* Detailed Reason Pop-up Banner */}
        <div className="max-w-xl w-full bg-panel/90 border-2 border-panelBorder p-3.5 sm:p-4 rounded-xs shadow-xl mb-6 backdrop-blur-sm">
          <p className="font-tech text-base sm:text-lg text-white font-medium leading-snug">
            {displayReason}
          </p>
          <div className="mt-2.5 pt-2 border-t border-panelBorder/60 flex items-center justify-between text-xs font-mono text-gray-400">
            <span className="flex items-center gap-1.5">
              <Code2 size={13} className="text-primary" />
              <span>{assignedCodeProject?.codeName || 'SPACE STATION SERVICES'}</span>
            </span>
            <span className="text-success font-bold">
              TASKS: {totalTasksCompleted}/{totalGameTasks > 0 ? totalGameTasks : 5} (100%)
            </span>
          </div>
        </div>

        {/* Final Roster & Roles Reveal */}
        <div className="w-full bg-black/80 border-2 border-panelBorder p-3.5 rounded-xs shadow-2xl mb-8 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-panelBorder/70 text-xs font-tech text-gray-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Users size={14} /> CREW ROSTER & REVEALED ROLES
            </span>
            <span>{players.length} PLAYERS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {players.map((p) => {
              const playerIsMafia = p.role === 'MAFIA';
              const isMe = p.id === localPlayer?.id;

              return (
                <div
                  key={p.id}
                  className={`p-2.5 bg-black/90 border-2 ${
                    playerIsMafia 
                      ? 'border-[#FF003C]/80 shadow-[0_0_12px_rgba(255,0,60,0.3)]' 
                      : 'border-panelBorder'
                  } rounded-xs flex flex-col items-center gap-1.5 relative`}
                >
                  {isMe && (
                    <span className="absolute top-1 left-1 px-1 text-[8px] font-pixel bg-primary text-black">
                      YOU
                    </span>
                  )}
                  <div 
                    className="w-12 h-14 border-2 border-current flex items-center justify-center bg-black/60 overflow-hidden shadow-sm"
                    style={{ color: p.color }}
                  >
                    <img 
                      src={getPlayerAvatarUrl(p.color)} 
                      alt={p.username} 
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <span className="font-tech text-xs text-white font-bold truncate max-w-full">
                    {p.username}
                  </span>

                  <span 
                    className={`px-1.5 py-0.5 text-[9px] font-pixel rounded-xs border ${
                      playerIsMafia 
                        ? 'bg-[#FF003C]/20 border-[#FF003C] text-[#FF003C]' 
                        : 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                    }`}
                  >
                    {playerIsMafia ? 'MAFIA' : 'DEVELOPER'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: 1. PLAY AGAIN & 2. RETURN TO MENU */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
          {/* OPTION 1: PLAY AGAIN */}
          <button
            onClick={handlePlayAgainClick}
            className={`w-full sm:flex-1 py-3 px-6 font-pixel text-sm tracking-wider flex items-center justify-center gap-2 rounded-xs border-2 shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
              isMafiaWinner 
                ? 'bg-[#FF003C] hover:bg-[#FF003C]/90 text-white border-white shadow-[0_0_20px_rgba(255,0,60,0.6)]' 
                : 'bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black border-white shadow-[0_0_20px_rgba(0,240,255,0.6)]'
            }`}
          >
            <RotateCcw size={16} />
            <span>PLAY AGAIN</span>
          </button>

          {/* OPTION 2: RETURN TO MENU */}
          <button
            onClick={handleReturnToMenuClick}
            className="w-full sm:flex-1 py-3 px-6 font-pixel text-sm tracking-wider flex items-center justify-center gap-2 rounded-xs border-2 border-panelBorder hover:border-white bg-panel hover:bg-panel/70 text-gray-200 hover:text-white shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <LogOut size={16} />
            <span>RETURN TO MENU</span>
          </button>
        </div>

      </div>
    </div>
  );
}
