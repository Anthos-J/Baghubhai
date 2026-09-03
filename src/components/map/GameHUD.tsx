import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../hooks/useGame';
import { useMockStore } from '../../store/mockStore';
import { leaveRoom } from '../../lib/roomService';
import { GameButton } from '../ui/GameButton';
import { AlertTriangle, Clock, Map as MapIcon, CheckSquare, Check, LogOut } from 'lucide-react';
import { RoomEditorModal, isCodingRoom } from '../../editor';
import AdminMapModal from './AdminMapModal';

export default function GameHUD() {
  const navigate = useNavigate();
  const { interactableRoom, callMeeting, gamePhase } = useGame();
  const [editorOpen, setEditorOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const clearRoom = useMockStore((s) => s.clearRoom);

  // ── Game Timer Hookup ──
  const gameTimeRemaining = useMockStore((s) => s.gameTimeRemaining);
  const isGameTimerPaused = useMockStore((s) => s.isGameTimerPaused);
  const tickGameTimer = useMockStore((s) => s.tickGameTimer);

  // ── Code Tasks Hookup ──
  const tasks = useMockStore((s) => s.tasks);
  const completeTask = useMockStore((s) => s.completeTask);

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

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

  // Close editor if player walks away from the room zone
  useEffect(() => {
    if (!interactableRoom) {
      setEditorOpen(false);
    }
  }, [interactableRoom]);

  // Handle exiting room and navigating home
  const handleConfirmExit = async () => {
    setIsExiting(true);
    try {
      await leaveRoom();
    } catch (err) {
      console.error('Error leaving room:', err);
    }
    clearRoom();
    navigate('/');
  };

  // Listen to keyboard shortcuts:
  // - 'E' to open coding room terminal
  // - 'SPACE' or 'E' to trigger emergency meeting when at Emergency Terminal
  // - 'M' to toggle map layout
  // - 'Escape' to dismiss modals
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

      // Escape closes open modals
      if (e.key === 'Escape') {
        if (showExitModal) {
          setShowExitModal(false);
          return;
        }
        if (mapOpen) {
          setMapOpen(false);
          return;
        }
        if (editorOpen) {
          setEditorOpen(false);
          return;
        }
      }

      // 'M' toggles the map
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setMapOpen((prev) => !prev);
        return;
      }

      // Only handle in-game interaction shortcuts in active PLAYING phase
      if (gamePhase !== 'PLAYING') return;

      if (interactableRoom === 'EMERGENCY_TERMINAL' && (e.code === 'Space' || e.key.toLowerCase() === 'e')) {
        e.preventDefault();
        callMeeting();
        return;
      }

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
  }, [interactableRoom, editorOpen, mapOpen, showExitModal, callMeeting, gamePhase]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 select-none">
      {/* ── 1. TOP CENTER: Task Progress Bar, Timer & Exit Button on Left ── */}
      <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 flex items-start gap-2 sm:gap-3 z-40 pointer-events-auto">
        {/* Exit Button positioned on the left side of the task bar */}
        <button
          onClick={() => setShowExitModal(true)}
          className="px-2.5 sm:px-3 py-2 bg-black/90 hover:bg-mafia/20 border-2 border-panelBorder hover:border-mafia text-mafia hover:text-white text-xs font-tech flex items-center gap-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.8)] transition-all hover:scale-105 active:scale-95 cursor-pointer rounded-xs mt-0.5"
          title="Exit Game"
        >
          <LogOut size={15} />
          <span className="font-bold">EXIT</span>
        </button>

        {/* Total Tasks Progress Bar & Centered Timer */}
        <div className="flex flex-col items-center">
          {/* Progress Bar Container */}
          <div className="bg-black/90 border-2 border-panelBorder px-4 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.8)] flex flex-col items-center">
            <div className="font-tech text-gray-300 text-[11px] tracking-wider uppercase flex items-center gap-2">
              <span>TOTAL TASKS COMPLETED</span>
              <span className="font-mono text-success font-bold">
                {completedCount}/{tasks.length}
              </span>
            </div>
            <div className="w-56 sm:w-80 h-3 bg-black border border-[#444] mt-1 relative overflow-hidden rounded-xs">
              <div
                className="h-full bg-success transition-all duration-500 shadow-[0_0_10px_#00FF00]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Shifted Game Timer directly under Task Bar */}
          <div className="bg-panel/90 border border-panelBorder px-3 py-0.5 mt-1 text-center shadow-md flex items-center gap-1.5 rounded-xs">
            <Clock size={12} className="text-primary animate-pulse" />
            <span className="font-tech text-[10px] text-gray-400 uppercase">GAME TIME</span>
            <span className="font-mono text-primary font-bold text-xs tracking-wider">
              {formatGameTime(gameTimeRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. TOP RIGHT: Map Button ── */}
      <div className="absolute top-2 sm:top-3 right-3 sm:right-4 z-40 pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => setMapOpen((prev) => !prev)}
          className="px-3 py-1.5 bg-panel/90 hover:bg-panel border-2 border-panelBorder hover:border-success text-white text-xs font-tech flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer rounded-xs"
          title="Open Facility Map [M]"
        >
          <MapIcon size={16} className="text-success" />
          <span className="font-bold">MAP [M]</span>
        </button>
      </div>

      {/* ── 3. RIGHT HAND SIDE: Code Tasks Frame ── */}
      <div className="absolute top-16 right-3 sm:right-4 z-30 pointer-events-auto w-64 sm:w-72 bg-black/85 border-2 border-panelBorder p-3 shadow-2xl backdrop-blur-xs flex flex-col gap-2 animate-in fade-in slide-in-from-right-4 duration-300 rounded-xs">
        <div className="flex justify-between items-center pb-1.5 border-b border-panelBorder/70">
          <span className="font-tech text-xs text-warning tracking-wider flex items-center gap-1.5 font-bold">
            <CheckSquare size={14} /> CODE TASKS
          </span>
          <span className="font-mono text-[10px] text-gray-400">
            {completedCount}/{tasks.length}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar text-xs">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-2 border rounded-xs transition-all flex items-start gap-2 ${
                task.completed
                  ? 'bg-success/15 border-success text-success shadow-[0_0_10px_rgba(0,255,0,0.15)]'
                  : 'bg-panel/70 border-panelBorder/70 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {task.completed ? (
                  <Check size={14} className="text-success stroke-[3]" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-warning/60 bg-warning/20 mt-0.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`font-tech font-bold text-[11px] leading-tight ${
                    task.completed ? 'text-success' : 'text-white'
                  }`}
                >
                  {task.title}
                </div>
                <div className="font-mono text-[9px] text-gray-400 truncate mt-0.5">
                  {task.fileName}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Center Terminal Interaction Prompt ── */}
      <div className="flex flex-col items-center justify-center flex-1">
        {interactableRoom && !editorOpen && isCodingRoom(interactableRoom) && (
          <div
            onClick={() => setEditorOpen(true)}
            className="bg-panel/95 border-4 border-primary p-6 animate-pulse text-center shadow-[0_0_30px_rgba(0,240,255,0.3)] pointer-events-auto cursor-pointer hover:border-warning transition-colors"
          >
            <div className="font-pixel text-xl text-primary mb-2">[{interactableRoom}]</div>
            <div className="font-tech text-white">
              Press <span className="text-warning font-bold">[E]</span> to Access Terminal
            </div>
          </div>
        )}
      </div>

      {/* ── 5. Bottom Left HUD: Emergency Call button ── */}
      <div className="flex justify-between items-end">
        <div className="pointer-events-auto">
          {interactableRoom === 'EMERGENCY_TERMINAL' && (
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

        <div className="pointer-events-auto" />
      </div>

      {/* ── 6. Room Editor Modal Overlay ── */}
      {editorOpen && interactableRoom && isCodingRoom(interactableRoom) && (
        <div className="pointer-events-auto">
          <RoomEditorModal
            roomId={interactableRoom}
            onClose={() => setEditorOpen(false)}
            onTaskPassed={(taskId) => {
              completeTask(taskId);
            }}
          />
        </div>
      )}

      {/* ── 7. Admin Facility Map Modal Overlay ── */}
      {mapOpen && <AdminMapModal onClose={() => setMapOpen(false)} />}

      {/* ── 8. Exit Game Confirmation Modal (Yes / No) ── */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 pointer-events-auto">
          <div className="max-w-md w-full bg-[#111827] border-4 border-mafia p-6 shadow-[0_0_50px_rgba(255,0,60,0.5)] text-center flex flex-col items-center animate-in zoom-in-95 duration-150 rounded-xs">
            <div className="w-16 h-16 bg-black border-2 border-mafia flex items-center justify-center text-mafia mb-4 shadow-[0_0_20px_rgba(255,0,60,0.4)]">
              <LogOut size={32} className="animate-pulse" />
            </div>

            <h3 className="font-pixel text-2xl text-white tracking-wider mb-2">
              EXIT GAME SESSION?
            </h3>

            <p className="font-tech text-gray-300 text-sm mb-6 leading-relaxed">
              Do you really want to exit the game? Your active progress will be lost and you will be returned to the main lobby menu.
            </p>

            <div className="flex items-center justify-center gap-3.5 w-full">
              {/* NO OPTION */}
              <button
                onClick={() => setShowExitModal(false)}
                disabled={isExiting}
                className="flex-1 py-2.5 px-4 bg-panel hover:bg-panel/70 border-2 border-panelBorder text-gray-200 hover:text-white font-pixel text-xs tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer rounded-xs"
              >
                NO, STAY
              </button>

              {/* YES OPTION */}
              <button
                onClick={handleConfirmExit}
                disabled={isExiting}
                className="flex-1 py-2.5 px-4 bg-mafia hover:bg-mafia/80 border-2 border-white text-white font-pixel text-xs tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_#FF003C] rounded-xs"
              >
                {isExiting ? 'EXITING...' : 'YES, EXIT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
