import { useEffect, useRef, useState } from 'react';
import { GameEngine } from './Engine';
import { usePlayers } from '../hooks/usePlayers';
import { useMockStore } from '../store/mockStore';
import { usePlayerMovement } from '../hooks/useRealtime';
import { getPlayerSettings } from '../lib/playerSettings';
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

  // ── FPS Display & Settings state ──
  const [fps, setFps] = useState(60);
  const [showFps, setShowFps] = useState(() => getPlayerSettings().display.showFps);

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setShowFps(getPlayerSettings().display.showFps);
    };
    window.addEventListener('among_devs_settings_updated', handleSettingsUpdate);
    window.addEventListener('storage', handleSettingsUpdate);
    return () => {
      window.removeEventListener('among_devs_settings_updated', handleSettingsUpdate);
      window.removeEventListener('storage', handleSettingsUpdate);
    };
  }, []);

  // ── Screen Shake triggers on real existing dramatic events ──
  const alarmActive = useMockStore((s) => s.alarmActive);
  const meetingAlertActive = useMockStore((s) => s.meetingAlertActive);
  const serverOverloadActive = useMockStore((s) => s.engineState.serverOverloadActive);

  const prevAlarmRef = useRef(false);
  const prevMeetingRef = useRef(false);
  const prevOverloadRef = useRef(false);

  useEffect(() => {
    const isShakeEnabled = getPlayerSettings().display.screenShake;
    if (isShakeEnabled && engineRef.current && alarmActive && !prevAlarmRef.current) {
      engineRef.current.triggerCameraShake(8, 0.4);
    }
    prevAlarmRef.current = alarmActive;
  }, [alarmActive]);

  useEffect(() => {
    const isShakeEnabled = getPlayerSettings().display.screenShake;
    if (isShakeEnabled && engineRef.current && meetingAlertActive && !prevMeetingRef.current) {
      engineRef.current.triggerCameraShake(12, 0.5);
    }
    prevMeetingRef.current = meetingAlertActive;
  }, [meetingAlertActive]);

  useEffect(() => {
    const isShakeEnabled = getPlayerSettings().display.screenShake;
    if (isShakeEnabled && engineRef.current && serverOverloadActive && !prevOverloadRef.current) {
      engineRef.current.triggerCameraShake(10, 0.4);
    }
    prevOverloadRef.current = serverOverloadActive;
  }, [serverOverloadActive]);

  // Initialize engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    // Wire up FPS updates
    engine.onFpsUpdate = (currentFps) => {
      setFps(currentFps);
    };

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

  // Update engine state when players change, and feed remote positions as interpolation targets
  useEffect(() => {
    if (engineRef.current && localPlayerState) {
      const playersCopy = JSON.parse(JSON.stringify(players));
      engineRef.current.updateState(playersCopy, localPlayerState.playerId);

      // Feed each remote player's latest broadcast position into the engine as a lerp target.
      // The engine glides toward these 60fps instead of snapping at the 10Hz broadcast rate.
      for (const player of players) {
        if (player.id !== localPlayerState.playerId) {
          engineRef.current.setRemoteTarget(player.id, player.x, player.y, player.direction);
        }
      }
    }
  }, [players, localPlayerState]);

  // Freeze movement when meeting alert is triggered or outside of PLAYING or modals open
  const gamePhase = useMockStore((s) => s.gamePhase);
  const editorOpen = useMockStore((s) => s.editorOpen);
  const mapOpen = useMockStore((s) => s.mapOpen);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.isFrozen = meetingAlertActive || gamePhase !== 'PLAYING' || editorOpen || mapOpen;
    }
  }, [meetingAlertActive, gamePhase, editorOpen, mapOpen]);

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

      {/* FPS Counter Overlay */}
      {showFps && (
        <div className="fixed top-3 left-4 z-40 pointer-events-none bg-black/85 border border-primary/40 px-2.5 py-1 rounded font-mono text-xs text-primary font-bold shadow-[0_0_10px_rgba(0,240,255,0.25)] tracking-wider">
          FPS: {fps}
        </div>
      )}

      {/* HTML Overlay HUD */}
      <GameHUD />
    </div>
  );
}
