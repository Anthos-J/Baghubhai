import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { useGame } from '../hooks/useGame';
import { useMockStore } from '../store/mockStore';
import { useGamePresence, useGameState, useEngineSync, useMeetingEvents } from '../hooks/useRealtime';
import { getSession } from '../lib/roomService';
import Result from './Result';
import Lobby from './Lobby';
import RoleReveal from './RoleReveal';
import MeetingModal from '../components/meeting/MeetingModal';
import EmergencyAlertOverlay from '../components/meeting/EmergencyAlertOverlay';
import GameCanvas from '../map/GameCanvas';

export default function Room() {
  const navigate = useNavigate();
  const { roomId } = useRoom();
  const { gamePhase } = useGame();
  const session = useMockStore((s) => s.session);
  const setSession = useMockStore((s) => s.setSession);
  const engineState = useMockStore((s) => s.engineState);
  const dispatchEngineAction = useMockStore((s) => s.dispatchEngineAction);
  const isHost = session?.isHost ?? false;

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
  const { broadcastEngineState } = useEngineSync(roomId || '', isHost);
  useMeetingEvents(roomId || '', session?.playerId || '');

  // ── Game Timer Loop (Host Only) ──
  useEffect(() => {
    if (!isHost || gamePhase !== 'PLAYING') return;

    const interval = setInterval(() => {
      dispatchEngineAction({ type: 'TICK', deltaSeconds: 1 });
    }, 1000);

    return () => clearInterval(interval);
  }, [isHost, gamePhase, dispatchEngineAction]);

  // ── Broadcast Engine State (Host Only) ──
  useEffect(() => {
    if (isHost) {
      broadcastEngineState(engineState);
    }
  }, [isHost, engineState, broadcastEngineState]);

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
      {/* ── Emergency Alert Klaxon Broadcast Overlay ── */}
      <EmergencyAlertOverlay />

      {(gamePhase === 'LOBBY' || gamePhase === 'ROLE_REVEAL') && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/assets/bg.jpg"
            className="w-full h-full object-cover"
          >
            <source src="/assets/Bg_live.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}
      {gamePhase === 'LOBBY' && <Lobby />}
      {gamePhase === 'ROLE_REVEAL' && <RoleReveal />}
      {gamePhase === 'PLAYING' && <GameCanvas />}
      {gamePhase === 'GAME_OVER' && <Result winner={engineState.winner?.winner === 'DEVELOPERS' ? 'developers' : 'mafia'} reason={engineState.winner?.reason} />}
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
