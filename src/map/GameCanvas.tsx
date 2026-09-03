import { useEffect, useRef } from 'react';
import { GameEngine } from './Engine';
import { usePlayers } from '../hooks/usePlayers';
import { useMockStore } from '../store/mockStore';
import GameHUD from '../components/map/GameHUD';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  
  const { players, localPlayerState } = usePlayers();
  const updatePlayerPosition = useMockStore(state => state.updatePlayerPosition);
  const setInteractableRoom = useMockStore(state => state.setInteractableRoom);

  // Initialize engine
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;
    
    // Wire up local movement to Zustand store
    engine.onLocalPlayerMove = (x, y, dir) => {
      if (localPlayerState) {
        updatePlayerPosition(localPlayerState.playerId, x, y, dir);
      }
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

  // Update engine state when players change (from React/Zustand)
  useEffect(() => {
    if (engineRef.current && localPlayerState) {
      // Create a deep copy of players so the engine can mutate the local player's position rapidly without waiting for React
      const playersCopy = JSON.parse(JSON.stringify(players));
      engineRef.current.updateState(playersCopy, localPlayerState.playerId);
    }
  }, [players, localPlayerState]);

  // Handle resizing
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-black text-white">
      <canvas ref={canvasRef} className="absolute inset-0 block" />
      
      {/* HTML Overlay HUD */}
      <GameHUD />

      {/* DEBUG HUD */}
      <div className="absolute top-0 left-0 z-50 bg-black/50 p-4 font-mono text-xs">
        <p>Players: {players.length}</p>
        <p>LocalPlayer: {localPlayerState?.playerId}</p>
        {players.find(p => p.id === localPlayerState?.playerId) && (
          <p>Player Pos: {players.find(p => p.id === localPlayerState?.playerId)?.x}, {players.find(p => p.id === localPlayerState?.playerId)?.y}</p>
        )}
      </div>
    </div>
  );
}
