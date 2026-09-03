import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { useGame } from '../hooks/useGame';
import { useMockStore } from '../store/mockStore';
import { useGamePresence, useGameState } from '../hooks/useRealtime';
import { getSession } from '../lib/roomService';
import Lobby from './Lobby';
import RoleReveal from './RoleReveal';
import MeetingModal from '../components/meeting/MeetingModal';
import GameCanvas from '../map/GameCanvas';
// import Result from './Result';

export default function Room() {
  const navigate = useNavigate();
  const { roomId } = useRoom();
  const { gamePhase } = useGame();
  const session = useMockStore((s) => s.session);
  const setSession = useMockStore((s) => s.setSession);

  // ── Restore session from localStorage if store is empty ──
  useEffect(() => {
    if (!session) {
      const saved = getSession();
      if (saved && saved.roomId === roomId) {
        setSession(saved);
      } else {
        // No valid session for this room — kick back to home
        navigate('/');
      }
    }
  }, [session, roomId]);

  // ── Initialize Realtime connections ──
  useGamePresence(roomId || '', session?.playerId || '');
  useGameState(roomId || '');

  // Don't render anything until we have a valid session
  if (!session) {
    return (
      <div className="w-full flex-1 flex items-center justify-center">
        <div className="font-tech text-gray-500 animate-pulse">CONNECTING...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center relative">
      {gamePhase === 'LOBBY' && <Lobby />}
      {gamePhase === 'ROLE_REVEAL' && <RoleReveal />}
      {gamePhase === 'PLAYING' && <GameCanvas />}
      {(gamePhase === 'MEETING' || gamePhase === 'VOTING') && (
        <>
          <div className="absolute inset-0 z-0 blur-sm pointer-events-none">
            <GameCanvas />
          </div>
          <MeetingModal />
        </>
      )}
    </div>
  );
}
