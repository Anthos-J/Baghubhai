import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PixelCard } from '../components/ui/PixelCard';
import { GameButton } from '../components/ui/GameButton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Settings, Play, Users, LogOut, Copy, Check, Loader2, Palette, X } from 'lucide-react';
import { useMockStore } from '../store/mockStore';
import { fetchRoomPlayers, fetchRoomSettings, leaveRoom, updatePlayerColor } from '../lib/roomService';
import { Player, AVATAR_COLORS } from '../types/game';
import { getPlayerAvatarUrl, resolvePlayerColor } from '../map/SpriteManager';
import { LobbySettingsModal } from '../components/lobby/LobbySettingsModal';

export default function Lobby() {
  const navigate = useNavigate();

  const players = useMockStore((s) => s.players);
  const session = useMockStore((s) => s.session);
  const roomCode = useMockStore((s) => s.roomCode);
  const startGame = useMockStore((s) => s.startGame);
  const setRoomPlayers = useMockStore((s) => s.setRoomPlayers);
  const clearRoom = useMockStore((s) => s.clearRoom);
  const engineState = useMockStore((s) => s.engineState);
  const updateSettings = useMockStore((s) => s.updateSettings);
  const setRoomSettings = useMockStore((s) => s.setRoomSettings);

  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  const isHost = session?.isHost ?? false;
  const localPlayerId = session?.playerId;
  const maxPlayers = engineState.settings.maxPlayers ?? 5;

  // ── Fetch real players and settings from Supabase on mount ──
  useEffect(() => {
    if (!session?.roomId) return;

    const load = async () => {
      setIsLoadingPlayers(true);
      const [dbPlayers, persistedSettings] = await Promise.all([
        fetchRoomPlayers(session.roomId),
        fetchRoomSettings(session.roomId),
      ]);

      if (persistedSettings) {
        setRoomSettings(persistedSettings);
      }

      // Sort: host first, then chronological join order (created_at)
      const sortedDbPlayers = [...dbPlayers].sort((a: any, b: any) => {
        if (a.is_host && !b.is_host) return -1;
        if (!a.is_host && b.is_host) return 1;
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeA - timeB;
      });

      const usedColors = new Set<string>();
      const mapped: Player[] = [];

      for (const p of sortedDbPlayers) {
        let playerColor = p.color;
        const colorName = resolvePlayerColor(playerColor);

        // If duplicate color detected, person who came afterwards is assigned random available color
        if (usedColors.has(colorName)) {
          const available = AVATAR_COLORS.filter((c) => !usedColors.has(c.name));
          if (available.length > 0) {
            const pick = available[Math.floor(Math.random() * available.length)];
            playerColor = pick.hex;
            usedColors.add(pick.name);

            // Synchronize reassignment to Supabase if local player or host
            if (p.id === localPlayerId || isHost) {
              updatePlayerColor(p.id, playerColor).catch(() => {});
            }
            if (p.id === localPlayerId && session) {
              useMockStore.getState().setSession({
                ...session,
                color: playerColor,
              });
            }
          } else {
            usedColors.add(colorName);
          }
        } else {
          usedColors.add(colorName);
        }

        mapped.push({
          id: p.id,
          room_id: p.room_id,
          username: p.username,
          color: playerColor,
          x: 1420,
          y: 960,
          direction: 'down' as const,
          alive: p.alive,
          connected: true, // we assume everyone online until Presence says otherwise
          is_host: p.is_host,
        });
      }

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

  // ── Change Avatar ──
  const handleSelectAvatar = async (colorHex: string) => {
    if (!localPlayerId || !session) return;
    try {
      const finalHex = await updatePlayerColor(localPlayerId, colorHex);
      useMockStore.getState().setSession({ ...session, color: finalHex });
      const updated = players.map((p) => (p.id === localPlayerId ? { ...p, color: finalHex } : p));
      setRoomPlayers(updated);
      setIsAvatarPickerOpen(false);
    } catch (err) {
      console.error('Failed to update avatar color:', err);
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
              <span className="text-white">{players.length}/{maxPlayers}</span>
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
                      {isLocal && (
                        <button
                          onClick={() => setIsAvatarPickerOpen(true)}
                          className="mt-3 text-[10px] font-tech text-primary hover:text-white border border-primary/40 hover:border-primary px-2 py-1 bg-primary/10 hover:bg-primary/20 transition-all cursor-pointer flex items-center justify-center gap-1 mx-auto rounded"
                          title="Change your avatar"
                        >
                          <Palette size={12} /> CHANGE AVATAR
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 pt-4 border-t-2 border-panelBorder flex justify-between items-center">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 text-textMuted hover:text-white font-tech transition-colors hover:bg-white/5 px-3 py-2 rounded-lg border border-transparent hover:border-panelBorder"
            >
              <Settings size={20} className="text-primary" /> GAME SETTINGS
            </button>
            <div className="w-64">
              {isHost ? (
                <GameButton
                  variant="success"
                  icon={<Play size={18} />}
                  onClick={startGame}
                  disabled={players.length < 1}
                >
                  {players.length < 1 ? 'NEED 1+ PLAYERS' : 'START GAME'}
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

      {/* Lobby Game Settings Modal */}
      <LobbySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={engineState.settings}
        isHost={isHost}
        onSaveSettings={(newSettings) => updateSettings(newSettings)}
      />

      {/* Avatar Picker Modal */}
      {isAvatarPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-panel border-4 border-panelBorder p-6 relative flex flex-col gap-4 shadow-2xl">
            <button
              onClick={() => setIsAvatarPickerOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="font-pixel text-xl text-white flex items-center gap-2">
              <Palette className="text-primary" size={20} /> CHOOSE YOUR AVATAR
            </h2>
            <div className="text-xs font-tech text-gray-400">
              Select an available avatar. No two players can share the same color.
            </div>

            <div className="grid grid-cols-3 gap-3 my-2 max-h-[60vh] overflow-y-auto p-1">
              {AVATAR_COLORS.map((item) => {
                const otherPlayerTaken = players.some(
                  (p) => p.id !== localPlayerId && resolvePlayerColor(p.color) === item.name
                );
                const isSelected = resolvePlayerColor(session?.color || '') === item.name;

                return (
                  <button
                    key={item.name}
                    disabled={otherPlayerTaken}
                    onClick={() => handleSelectAvatar(item.hex)}
                    className={`flex flex-col items-center p-3 border-2 transition-all rounded bg-black/70 relative ${
                      isSelected
                        ? 'border-white scale-105 shadow-[0_0_12px_rgba(255,255,255,0.6)] bg-white/10'
                        : otherPlayerTaken
                        ? 'border-red-900/50 opacity-40 cursor-not-allowed'
                        : 'border-[#2a2a2a] hover:border-primary hover:bg-white/5 cursor-pointer'
                    }`}
                  >
                    {otherPlayerTaken && (
                      <div className="absolute top-1 right-1 bg-red-900/90 text-white font-pixel text-[7px] px-1 py-0.5 rounded">
                        TAKEN
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-1 left-1 bg-primary text-black font-pixel text-[7px] px-1 py-0.5 rounded">
                        CURRENT
                      </div>
                    )}
                    <div
                      className="w-14 h-14 border-2 flex items-center justify-center bg-black/80 overflow-hidden mb-2 shadow"
                      style={{ borderColor: item.hex }}
                    >
                      <img
                        src={`/assets/${item.name}.png`}
                        alt={item.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <span className="font-pixel text-[10px] text-white uppercase tracking-wider">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAvatarPickerOpen(false)}
                className="px-4 py-2 bg-panel border-2 border-panelBorder hover:border-white text-xs font-tech text-white transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

