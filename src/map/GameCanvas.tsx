import { useEffect, useRef } from 'react';
import { GameEngine } from './Engine';
import { usePlayers } from '../hooks/usePlayers';
import { useMockStore } from '../store/mockStore';
import { usePlayerMovement } from '../hooks/useRealtime';
import GameHUD from '../components/map/GameHUD';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const { players, localPlayerState } = usePlayers();
  const session = useMockStore((s) => s.session);
  const setInteractableRoom = useMockStore((s) => s.setInteractableRoom);

  const roomId = session?.roomId || '';
  const playerId = session?.playerId || '';

  const { broadcastMovement } = usePlayerMovement(roomId, playerId);

  // Initialize engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    // Wire up local movement to Broadcast
    engine.onLocalPlayerMove = (x, y, dir) => {
      broadcastMovement(x, y, dir);
    };

    // Wire up interaction zone changes
    engine.onInteractableRoomChange = (room) => {
      setInteractableRoom(room);
    };

    engine.start();

    return () => {
      engine.stop();
    };
  }, []);

  // Update engine state when players change
  useEffect(() => {
    if (engineRef.current && localPlayerState) {
      const playersCopy = JSON.parse(JSON.stringify(players));
      engineRef.current.updateState(playersCopy, localPlayerState.playerId);
    }
  }, [players, localPlayerState]);

  // Freeze movement when meeting alert is triggered or outside of PLAYING
  const meetingAlertActive = useMockStore((s) => s.meetingAlertActive);
  const gamePhase = useMockStore((s) => s.gamePhase);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.isFrozen = meetingAlertActive || gamePhase !== 'PLAYING';
    }
  }, [meetingAlertActive, gamePhase]);

  // Handle resizing
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-black text-white">
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* HTML Overlay HUD */}
      <GameHUD />
    </div>
  );
}
