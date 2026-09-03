import { useState, useEffect } from 'react';
import { useGame } from '../../hooks/useGame';
import { GameButton } from '../ui/GameButton';
import { AlertTriangle } from 'lucide-react';
import { RoomEditorModal, isCodingRoom } from '../../editor';

export default function GameHUD() {
  const { interactableRoom, callMeeting } = useGame();
  const [editorOpen, setEditorOpen] = useState(false);

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

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
      {/* Top HUD */}
      <div className="flex justify-between items-start">
        <div className="bg-panel/90 border-2 border-panelBorder p-2 pointer-events-auto">
          <div className="font-tech text-gray-400 text-xs">GLOBAL TASK PROGRESS</div>
          <div className="w-48 h-4 bg-black border-2 border-[#333] mt-1 relative overflow-hidden">
            <div className="h-full bg-success w-[30%]" />
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
            <div className="font-tech text-white">Press <span className="text-warning font-bold">[E]</span> to Access Terminal</div>
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
            onClose={() => setEditorOpen(false)}
            onTaskPassed={(taskId) => {
              console.log(`Task passed in ${interactableRoom}: ${taskId}`);
            }}
          />
        </div>
      )}
    </div>
  );
}

