import { useState, useEffect } from 'react';
import { useGame } from '../../hooks/useGame';
import { useMockStore } from '../../store/mockStore';
import { usePlayers } from '../../hooks/usePlayers';
import { GameButton } from '../ui/GameButton';
import { AlertTriangle, Clock } from 'lucide-react';
import { RoomEditorModal, isCodingRoom, getTaskIdForRoom, getPlayerTaskInRoom } from '../../editor';

export default function GameHUD() {
  const { interactableRoom, callMeeting, gamePhase, progress, completeTask, myPrivateTasks, publicProject, assignTasks } = useGame();
  const { players, localPlayer } = usePlayers();
  const [editorOpen, setEditorOpen] = useState(false);
  
  const engineState = useMockStore((s) => s.engineState);
  const session = useMockStore((s) => s.session);
  const players = useMockStore((s) => s.players);
  
  const localPlayer = players.find((p) => p.id === session?.playerId);
  const isAlive = localPlayer ? localPlayer.alive : true;

  const mins = Math.floor(engineState.gameTimeRemaining / 60);
  const secs = engineState.gameTimeRemaining % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // ── Game Timer Hookup ──
  const gameTimeRemaining = useMockStore((s) => s.gameTimeRemaining);
  const isGameTimerPaused = useMockStore((s) => s.isGameTimerPaused);
  const tickGameTimer = useMockStore((s) => s.tickGameTimer);

  useEffect(() => {
    if (isGameTimerPaused) return;
    const timer = setInterval(() => {
      tickGameTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameTimerPaused, tickGameTimer]);

  const formatGameTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize private tasks for local player if not yet assigned
  useEffect(() => {
    if (localPlayer && (!myPrivateTasks || myPrivateTasks.length === 0)) {
      assignTasks?.();
    }
  }, [localPlayer, myPrivateTasks, assignTasks]);

  // Check if local player is ghost / eliminated
  const isGhost = localPlayer
    ? localPlayer.alive === false ||
      localPlayer.status === 'GHOST' ||
      localPlayer.status === 'ELIMINATED'
    : false;

  // Retrieve local player's private task for this specific room (Strictly isolated to local player)
  const currentPrivateTask = localPlayer && interactableRoom
    ? getPlayerTaskInRoom(myPrivateTasks, localPlayer.id, interactableRoom)
    : null;

  // Calculate anonymous presence (count of other alive players connected in game)
  const otherPlayersCount = players.filter(
    (p) => p.id !== localPlayer?.id && p.connected && (p.alive !== false && p.status !== 'ELIMINATED' && p.status !== 'GHOST')
  ).length;

  // Close editor if player walks away from the room zone
  useEffect(() => {
    if (!interactableRoom) {
      setEditorOpen(false);
    }
  }, [interactableRoom]);

  // Listen to keyboard shortcuts:
  // - 'E' to open coding room terminal
  // - 'SPACE' or 'E' to trigger emergency meeting when at Emergency Terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in chat input or any form field
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Only handle game shortcuts in active PLAYING phase
      if (gamePhase !== 'PLAYING') return;

      if (interactableRoom === 'EMERGENCY_TERMINAL' && (e.code === 'Space' || e.key.toLowerCase() === 'e')) {
        e.preventDefault();
        callMeeting();
        return;
      }

      if (
        e.key.toLowerCase() === 'e' &&
        isAlive &&
        interactableRoom &&
        isCodingRoom(interactableRoom) &&
        !editorOpen
      ) {
        setEditorOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactableRoom, editorOpen, isAlive, callMeeting, gamePhase]);

  // Handler for deterministic task completion from RoomEditorModal
  const handleTaskPassed = (passedTaskId: string, updatedCode?: string) => {
    // 1. Validate local player exists and is alive
    if (!localPlayer || isGhost) {
      console.warn('Rejected task completion: Player is eliminated / ghost.');
      return;
    }

    // 2. Validate room context
    if (!interactableRoom || !isCodingRoom(interactableRoom)) {
      console.warn('Rejected task completion: Not in a valid coding room.');
      return;
    }

    // 3. Dispatch authoritative task completion to P4 state engine
    if (completeTask) {
      completeTask(passedTaskId, localPlayer.id, updatedCode);
    }
  };

  // Clamp progress for safe rendering between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress ?? 0));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
      {/* Top HUD */}
      <div className="flex justify-between items-start">
        <div className="bg-panel/90 border-2 border-panelBorder p-2 pointer-events-auto">
          <div className="flex justify-between items-center gap-4">
            <span className="font-tech text-gray-400 text-xs">GLOBAL TASK PROGRESS</span>
            <span className="font-mono text-xs text-primary font-bold">{clampedProgress}%</span>
          </div>
          <div className="w-48 h-4 bg-black border-2 border-[#333] mt-1 relative overflow-hidden">
            <div
              className="h-full bg-success transition-all duration-500 ease-out"
              style={{ width: `${engineState.progress}%` }}
            />
          </div>
        </div>

        <div className="bg-panel/90 border-2 border-panelBorder px-4 py-2 text-center pointer-events-auto shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <div className="font-tech text-gray-400 text-xs flex items-center justify-center gap-1">
            <Clock size={12} className="text-primary" /> GAME TIME
          </div>
          <div className={`font-mono font-bold text-lg ${engineState.gameTimeRemaining <= 60 ? 'text-mafia animate-pulse' : 'text-primary'}`}>
            {formattedTime}
          </div>
        </div>
      </div>

      {/* Center Interaction Overlay */}
      <div className="flex flex-col items-center justify-center flex-1">
        {isAlive && interactableRoom && !editorOpen && isCodingRoom(interactableRoom) && (
          <div
            onClick={() => setEditorOpen(true)}
            className="bg-panel/95 border-4 border-primary p-6 animate-pulse text-center shadow-[0_0_30px_rgba(0,240,255,0.3)] pointer-events-auto cursor-pointer hover:border-warning transition-colors"
          >
            <div className="font-pixel text-xl text-primary mb-2">[{interactableRoom}]</div>
            <div className="font-tech text-white">
              Press <span className="text-warning font-bold">[E]</span> to Access Terminal
              {isGhost && <span className="ml-2 text-mafia text-xs font-bold">[GHOST / READ-ONLY]</span>}
              {currentPrivateTask && (
                <div className="mt-1 font-mono text-xs text-primary">
                  Assigned: {currentPrivateTask.title}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom HUD: Emergency Call button on BOTTOM LEFT ── */}
      <div className="flex justify-between items-end">
        {/* Bottom Left: Emergency Meeting Prompt */}
        <div className="pointer-events-auto">
          {isAlive && interactableRoom === 'EMERGENCY_TERMINAL' && (
            <div className="bg-black/90 border-4 border-[#FF003C] p-4 flex flex-col gap-2 shadow-[0_0_30px_rgba(255,0,60,0.6)] animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-center gap-2 text-[#FF003C] font-tech text-xs tracking-wider uppercase font-bold">
                <AlertTriangle size={16} className="animate-pulse text-[#FFB800]" />
                EMERGENCY TERMINAL DETECTED
              </div>
              <GameButton
                variant="danger"
                icon={<AlertTriangle size={20} />}
                onClick={callMeeting}
                className="text-base px-6 py-3 font-pixel tracking-wider shadow-[0_0_20px_#FF003C] hover:scale-105 transition-transform"
              >
                CALL FOR MEET [SPACE]
              </GameButton>
            </div>
          )}
        </div>

        {/* Bottom Right: Placeholder for future action buttons */}
        <div className="pointer-events-auto" />
      </div>

      {/* Room Editor Modal Overlay */}
      {editorOpen && interactableRoom && isCodingRoom(interactableRoom) && (
        <div className="pointer-events-auto">
          <RoomEditorModal
            roomId={interactableRoom}
            publicProject={publicProject}
            privateTask={currentPrivateTask}
            anonymousPresenceCount={otherPlayersCount}
            readOnly={isGhost}
            onClose={() => setEditorOpen(false)}
            onTaskPassed={handleTaskPassed}
          />
        </div>
      )}
    </div>
  );
}




