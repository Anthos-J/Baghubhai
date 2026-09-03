import { useState, useEffect } from 'react';
import { useGame } from '../../hooks/useGame';
import { usePlayers } from '../../hooks/usePlayers';
import { GameButton } from '../ui/GameButton';
import { AlertTriangle } from 'lucide-react';
import { RoomEditorModal, isCodingRoom, getTaskIdForRoom, getPlayerTaskInRoom } from '../../editor';

export default function GameHUD() {
  const { interactableRoom, callMeeting, progress, completeTask, myPrivateTasks, publicProject, assignTasks } = useGame();
  const { players, localPlayer } = usePlayers();
  const [editorOpen, setEditorOpen] = useState(false);

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

  // Listen to 'E' key when there is an interactable coding room
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'e' &&
        interactableRoom &&
        isCodingRoom(interactableRoom) &&
        !editorOpen
      ) {
        setEditorOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactableRoom, editorOpen]);

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
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-panel/90 border-2 border-panelBorder p-2 text-center pointer-events-auto">
          <div className="font-tech text-gray-400 text-xs">GAME TIME</div>
          <div className="font-mono text-primary font-bold">14:59</div>
        </div>
      </div>

      {/* Center Interaction Overlay */}
      <div className="flex flex-col items-center justify-center flex-1">
        {interactableRoom && !editorOpen && isCodingRoom(interactableRoom) && (
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

      {/* Bottom HUD */}
      <div className="flex justify-end pointer-events-auto">
        {/* Placeholder for Emergency Terminal Zone interaction */}
        {interactableRoom === 'EMERGENCY_TERMINAL' && (
          <GameButton variant="danger" icon={<AlertTriangle />} onClick={callMeeting} className="text-xl px-8 py-4 animate-bounce">
            CALL EMERGENCY MEETING
          </GameButton>
        )}
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




