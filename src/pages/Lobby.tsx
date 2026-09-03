import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PixelCard } from '../components/ui/PixelCard';
import { GameButton } from '../components/ui/GameButton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Settings, Play, Users, LogOut, Copy, Check, Loader2 } from 'lucide-react';
import { useMockStore } from '../store/mockStore';
import { fetchRoomPlayers, leaveRoom } from '../lib/roomService';
import { Player } from '../types/game';
import { getPlayerAvatarUrl } from '../map/SpriteManager';

export default function Lobby() {
  const navigate = useNavigate();

  const players = useMockStore((s) => s.players);
  const session = useMockStore((s) => s.session);
  const roomCode = useMockStore((s) => s.roomCode);
  const startGame = useMockStore((s) => s.startGame);
  const setRoomPlayers = useMockStore((s) => s.setRoomPlayers);
  const clearRoom = useMockStore((s) => s.clearRoom);

  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);

  const isHost = session?.isHost ?? false;
  const localPlayerId = session?.playerId;

  // ── Fetch real players from Supabase on mount ──
  useEffect(() => {
    if (!session?.roomId) return;

    const load = async () => {
      setIsLoadingPlayers(true);
      const dbPlayers = await fetchRoomPlayers(session.roomId);

      const mapped: Player[] = dbPlayers.map((p: any) => ({
        id: p.id,
        room_id: p.room_id,
        username: p.username,
        color: p.color,
        x: 1000,
        y: 750,
        direction: 'down' as const,
        alive: p.alive,
        connected: true, // we assume everyone online until Presence says otherwise
        is_host: p.is_host,
      }));

      setRoomPlayers(mapped);
      setIsLoadingPlayers(false);
    };

    load();
  }, [session?.roomId]);

  // ── Leave room ──
  const handleLeave = async () => {
    await leaveRoom();
    clearRoom();
    navigate('/');
  };

  // ── Copy room code ──
  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl flex flex-col p-4 relative text-textMain">
      <header className="flex justify-between items-end w-full z-10 p-4 border-b-4 border-panelBorder bg-panel/80">
        <div>
          <h1 className="font-pixel text-2xl text-white whitespace-nowrap">
            &lt;<span className="text-[#0066FF]">AMONG</span>{' '}
            <span className="text-mafia">DEVS</span>&gt;
          </h1>
          <div className="font-mono text-sm text-gray-400 mt-2 flex items-center gap-2">
            ROOM:{' '}
            <span className="text-warning font-bold tracking-widest">
              {roomCode || '-----'}
            </span>
            <button
              onClick={handleCopyCode}
              className="text-gray-500 hover:text-white transition-colors"
              title="Copy room code"
            >
              {codeCopied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-tech text-gray-400 flex items-center gap-2">
              <Users size={16} /> PLAYER COUNT:{' '}
              <span className="text-white">{players.length}/10</span>
            </div>
          </div>
          <button
            onClick={handleLeave}
            className="p-2 bg-panel border-2 border-mafia/50 hover:border-mafia hover:bg-mafia/20 transition-colors text-mafia text-xs font-tech flex items-center gap-1"
          >
            <LogOut size={14} /> LEAVE
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center w-full z-10 p-4 md:p-8">
        <PixelCard title="LOBBY TERMINAL" className="w-full min-h-[500px] flex flex-col">
          {isLoadingPlayers ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-primary" />
              <span className="ml-3 font-tech text-gray-400">Loading players...</span>
            </div>
          ) : players.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="font-tech text-gray-500">
                No players yet. Share the room code to invite friends!
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 flex-1">
              {players.map((p) => {
                const playerIsHost = p.is_host;
                const isLocal = p.id === localPlayerId;

                return (
                  <div
                    key={p.id}
                    className={`border-2 ${
                      isLocal ? 'border-primary' : 'border-panelBorder'
                    } bg-black p-4 flex flex-col items-center justify-center gap-4 relative`}
                  >
                    {playerIsHost && (
                      <div className="absolute top-0 right-0 bg-warning text-black font-pixel text-[8px] px-2 py-1">
                        HOST
                      </div>
                    )}
                    {isLocal && (
                      <div className="absolute top-0 left-0 bg-primary text-black font-pixel text-[8px] px-2 py-1">
                        YOU
                      </div>
                    )}
                    <div className="w-24 h-28 border-2 border-current flex items-center justify-center bg-black/60 overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)]" style={{ color: p.color }}>
                      <img 
                        src={getPlayerAvatarUrl(p.color)} 
                        alt={p.username} 
                        className="w-full h-full object-cover object-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="text-center w-full">
                      <div className="font-tech font-bold text-lg text-white truncate w-full px-2">
                        {p.username}
                      </div>
                      <StatusBadge
                        status={p.connected ? 'online' : 'offline'}
                        label={p.connected ? 'online' : 'offline'}
                        className="mt-2 mx-auto"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 pt-4 border-t-2 border-panelBorder flex justify-between items-center">
            <button className="flex items-center gap-2 text-textMuted hover:text-white font-tech transition-colors">
              <Settings size={20} /> GAME SETTINGS
            </button>
            <div className="w-64">
              {isHost ? (
                <GameButton
                  variant="success"
                  icon={<Play size={18} />}
                  onClick={startGame}
                  disabled={players.length < 4}
                >
                  {players.length < 4 ? 'NEED 4+ PLAYERS' : 'START GAME'}
                </GameButton>
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
