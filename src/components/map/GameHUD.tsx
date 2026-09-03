import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../hooks/useGame';
import { usePlayers } from '../../hooks/usePlayers';
import { useMockStore } from '../../store/mockStore';
import { leaveRoom } from '../../lib/roomService';
import { GameButton } from '../ui/GameButton';
import {
  AlertTriangle,
  Clock,
  Map as MapIcon,
  CheckSquare,
  Check,
  LogOut,
  Bug,
  Flame,
  Radio,
} from 'lucide-react';
import { RoomEditorModal, isCodingRoom, getTaskIdForRoom, getPlayerTaskInRoom } from '../../editor';
import AdminMapModal from './AdminMapModal';
import Minimap from './Minimap';

export default function GameHUD() {
  const navigate = useNavigate();
  const {
    interactableRoom,
    callMeeting,
    gamePhase,
    progress,
    myPrivateTasks,
    publicProject,
  } = useGame();
  const { players, localPlayer } = usePlayers();
  const [editorOpen, setEditorOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [tasksCollapsed, setTasksCollapsed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const clearRoom = useMockStore((s) => s.clearRoom);
  const engineState = useMockStore((s) => s.engineState);

  // ── Game Timer Hookup ──
  const gameTimeRemaining = useMockStore((s) => s.gameTimeRemaining);
  const isGameTimerPaused = useMockStore((s) => s.isGameTimerPaused);
  const tickGameTimer = useMockStore((s) => s.tickGameTimer);

  // ── Code Tasks Hookup ──
  const tasks = useMockStore((s) => s.tasks);
  const completeTask = useMockStore((s) => s.completeTask);

  // ── Sabotage & Mafia Hookup ──
  const escapeBufferSeconds = useMockStore((s) => s.escapeBufferSeconds);
  const mafiaNotifications = useMockStore((s) => s.mafiaNotifications);
  const triggerBugTaskAction = useMockStore((s) => s.triggerBugTaskAction);

  // ── Cumulative Multi-Player Tasks Hookup ──
  const totalTasksCompleted = useMockStore((s) => s.totalTasksCompleted);
  const totalGameTasks = useMockStore((s) => s.totalGameTasks);
  const completedTasksByPlayer = useMockStore((s) => s.completedTasksByPlayer);

  const isAlive = localPlayer ? localPlayer.alive : true;
  const isGhost = !isAlive;
  const isMafia = localPlayer?.role === 'MAFIA';

  // Active developers / crewmates who have tasks to complete
  const developerPlayers = players.filter((p) => p.role !== 'MAFIA');
  const activeDevelopersCount = developerPlayers.length > 0 ? developerPlayers.length : Math.max(1, players.length);

  // Effective cumulative total tasks across all players
  const effectiveTotalGameTasks = Math.max(
    tasks.length,
    totalGameTasks > 0 ? totalGameTasks : activeDevelopersCount * tasks.length
  );
  const effectiveTotalCompleted = Math.min(effectiveTotalGameTasks, totalTasksCompleted);
  const cumulativeProgressPercent = effectiveTotalGameTasks > 0
    ? Math.min(100, Math.round((effectiveTotalCompleted / effectiveTotalGameTasks) * 100))
    : (progress ?? 0);

  // Local player's own task list & count
  const isTaskCompleted = (t: (typeof tasks)[0]) => t.status === 'COMPLETED' || Boolean(t.completed);
  const myCompletedList = localPlayer?.id && completedTasksByPlayer[localPlayer.id]
    ? completedTasksByPlayer[localPlayer.id]
    : [];
  const myCompletedCount = myCompletedList.length > 0
    ? myCompletedList.length
    : tasks.filter(isTaskCompleted).length;

  // Determine room task for interactable zone
  const roomTaskId = interactableRoom ? getTaskIdForRoom(interactableRoom) : null;
  const roomTask = tasks.find(
    (t) => t.id === roomTaskId || (roomTaskId && t.id.includes(roomTaskId.replace('task-', '')))
  );
  const canBugThisRoom = isMafia && roomTask && roomTask.status === 'COMPLETED' && escapeBufferSeconds === null;

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
  // - 'B' to bug code terminal (Mafia only)
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

      if (isAlive && interactableRoom === 'EMERGENCY_TERMINAL' && (e.code === 'Space' || e.key.toLowerCase() === 'e')) {
        e.preventDefault();
        callMeeting();
        return;
      }

      // 'B' bugs the task if Mafia is in a room with a solved task
      if (e.key.toLowerCase() === 'b' && canBugThisRoom && roomTask && interactableRoom) {
        e.preventDefault();
        triggerBugTaskAction(roomTask.id, interactableRoom);
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
  }, [interactableRoom, editorOpen, mapOpen, showExitModal, isAlive, canBugThisRoom, roomTask, triggerBugTaskAction, callMeeting, gamePhase]);

  // Handler for task completion from RoomEditorModal
  const handleTaskPassed = (passedTaskId: string, updatedCode?: string) => {
    completeTask(passedTaskId, localPlayer?.id, updatedCode);
  };

  const currentPrivateTask =
    interactableRoom && localPlayer
      ? getPlayerTaskInRoom(myPrivateTasks, localPlayer.id, interactableRoom)
      : null;

  const otherPlayersCount = interactableRoom
    ? players.filter((p) => p.id !== localPlayer?.id && p.connected).length
    : 0;

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
                {effectiveTotalCompleted}/{effectiveTotalGameTasks}
              </span>
            </div>
            <div className="w-56 sm:w-80 h-3 bg-black border border-[#444] mt-1 relative overflow-hidden rounded-xs">
              <div
                className="h-full bg-success transition-all duration-500 shadow-[0_0_10px_#00FF00]"
                style={{ width: `${cumulativeProgressPercent}%` }}
              />
            </div>
            {activeDevelopersCount > 1 && (
              <div className="font-tech text-[9px] text-gray-400 mt-0.5 tracking-wider uppercase flex items-center gap-1.5">
                <span className="text-primary font-bold">{activeDevelopersCount} PLAYERS</span>
                <span>•</span>
                <span>CUMULATIVE CREW PROGRESS ({cumulativeProgressPercent}%)</span>
              </div>
            )}
          </div>

          {/* Shifted Game Timer directly under Task Bar */}
          <div className="bg-panel/90 border border-panelBorder px-3 py-0.5 mt-1 text-center shadow-md flex items-center gap-1.5 rounded-xs">
            <Clock size={12} className="text-primary animate-pulse" />
            <span className="font-tech text-[10px] text-gray-400 uppercase">GAME TIME</span>
            <span className="font-mono text-primary font-bold text-xs tracking-wider">
              {formatGameTime(gameTimeRemaining || engineState?.gameTimeRemaining || 900)}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. TOP RIGHT: Role Badge & Live HUD Minimap ── */}
      <div className="absolute top-2 sm:top-3 right-3 sm:right-4 z-40 pointer-events-auto flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          {/* Role Badge */}
          {isMafia ? (
            <div className="px-3 py-1 bg-[#FF003C]/20 border-2 border-[#FF003C] text-[#FF003C] text-xs font-pixel flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,0,60,0.5)]">
              <Flame size={13} className="animate-pulse" />
              <span>ROLE: MAFIA</span>
            </div>
          ) : (
            <div className="px-3 py-1 bg-[#00F0FF]/15 border-2 border-[#00F0FF] text-[#00F0FF] text-xs font-pixel flex items-center gap-1.5">
              <span>DEVELOPER</span>
            </div>
          )}

          <button
            onClick={() => setMapOpen((prev) => !prev)}
            className="px-2.5 py-1 bg-panel/90 hover:bg-panel border-2 border-panelBorder hover:border-success text-white text-xs font-tech flex items-center gap-1.5 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer rounded-xs"
            title="Open Full Facility Radar [M]"
          >
            <MapIcon size={14} className="text-success" />
            <span className="font-bold">RADAR [M]</span>
          </button>
        </div>

        {/* Live Interactive Minimap */}
        <Minimap onExpand={() => setMapOpen(true)} />
      </div>

      {/* ── 3. RIGHT HAND SIDE: Code Tasks Frame (Placed Beneath Minimap) ── */}
      <div className="absolute top-[230px] sm:top-[245px] right-3 sm:right-4 z-30 pointer-events-auto w-60 sm:w-68 bg-black/85 border-2 border-panelBorder p-2.5 shadow-2xl backdrop-blur-xs flex flex-col gap-1.5 animate-in fade-in slide-in-from-right-4 duration-300 rounded-xs">
        <div className="flex justify-between items-center pb-1 border-b border-panelBorder/70">
          <span className={`font-tech text-xs tracking-wider flex items-center gap-1.5 font-bold ${isMafia ? 'text-[#FF003C]' : 'text-warning'}`}>
            {isMafia ? (
              <>
                <Bug size={14} className="text-[#FF003C]" /> SABOTAGE OBJECTIVES
              </>
            ) : (
              <>
                <CheckSquare size={14} /> MY CODE TASKS
              </>
            )}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-gray-400">
              {isMafia
                ? `${tasks.filter((t) => t.status === 'BUGGED').length} BUGGED`
                : `${myCompletedCount}/${tasks.length}`}
            </span>
            <button
              onClick={() => setTasksCollapsed(!tasksCollapsed)}
              className="text-gray-400 hover:text-white text-xs font-mono px-1 hover:bg-white/10 rounded cursor-pointer leading-none"
              title={tasksCollapsed ? 'Expand Tasks' : 'Collapse Tasks'}
            >
              {tasksCollapsed ? '+' : '—'}
            </button>
          </div>
        </div>

        {!tasksCollapsed && (
          <div className="flex flex-col gap-1.5 max-h-[200px] sm:max-h-[250px] overflow-y-auto pr-1 custom-scrollbar text-xs">
            {tasks.map((task) => {
              const completed = isMafia
                ? isTaskCompleted(task)
                : myCompletedList.includes(task.id) || isTaskCompleted(task);
              const isBugged = task.status === 'BUGGED';

              return (
                <div
                  key={task.id}
                  className={`p-2 border rounded-xs transition-all flex items-start gap-2 ${
                    isMafia
                      ? completed
                        ? 'bg-yellow-950/40 border-yellow-500 text-yellow-300 shadow-[0_0_10px_rgba(255,184,0,0.2)]'
                        : isBugged
                        ? 'bg-red-950/40 border-red-500 text-red-300'
                        : 'bg-panel/70 border-panelBorder/70 text-gray-400'
                      : completed
                      ? 'bg-success/15 border-success text-success shadow-[0_0_10px_rgba(0,255,0,0.15)]'
                      : isBugged
                      ? 'bg-red-950/40 border-red-500 text-red-300'
                      : 'bg-panel/70 border-panelBorder/70 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isMafia ? (
                      completed ? (
                        <Bug size={14} className="text-yellow-400 animate-pulse" />
                      ) : isBugged ? (
                        <AlertTriangle size={14} className="text-red-500" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-gray-600 mt-0.5" />
                      )
                    ) : completed ? (
                      <Check size={14} className="text-success stroke-[3]" />
                    ) : isBugged ? (
                      <AlertTriangle size={14} className="text-red-500 animate-pulse" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-warning/60 bg-warning/20 mt-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-tech font-bold text-[11px] leading-tight ${
                        isMafia
                          ? completed
                            ? 'text-yellow-300'
                            : isBugged
                            ? 'text-red-400'
                            : 'text-gray-400'
                          : completed
                          ? 'text-success'
                          : isBugged
                          ? 'text-red-400'
                          : 'text-white'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono text-[9px] text-gray-400 truncate">
                        {task.fileName}
                      </span>
                      {isMafia && completed && (
                        <span className="font-pixel text-[9px] text-yellow-400 bg-yellow-950/80 px-1 py-0.5 border border-yellow-500">
                          READY TO BUG ⚠️
                        </span>
                      )}
                      {isBugged && (
                        <span className="font-pixel text-[9px] text-red-400 bg-red-950/80 px-1 py-0.5 border border-red-500">
                          BUGGED 🚨
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 4. Center Terminal Interaction / Bug Prompt ── */}
      <div className="flex flex-col items-center justify-center flex-1">
        {isAlive && interactableRoom && !editorOpen && isCodingRoom(interactableRoom) && (
          <div className="bg-panel/95 border-4 border-primary p-6 text-center shadow-[0_0_30px_rgba(0,240,255,0.3)] pointer-events-auto cursor-pointer hover:border-warning transition-colors">
            <div className="font-pixel text-xl text-primary mb-2">[{interactableRoom}]</div>
            
            {/* If Mafia is in a room with a solved task, show prominent BUG button */}
            {canBugThisRoom && roomTask ? (
              <div className="flex flex-col items-center gap-3">
                <div className="bg-yellow-950/60 border border-yellow-500 p-2 text-xs font-tech text-yellow-300">
                  Target module is currently solved by crew. You can bug it now!
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => triggerBugTaskAction(roomTask.id, interactableRoom)}
                    className="px-5 py-2.5 bg-[#FF003C] hover:bg-[#FF003C]/80 border-2 border-white text-white font-pixel text-xs tracking-wider shadow-[0_0_25px_#FF003C] flex items-center gap-2 cursor-pointer animate-bounce hover:scale-105 transition-transform"
                  >
                    <Bug size={18} /> BUG TASK [B]
                  </button>
                  <button
                    onClick={() => setEditorOpen(true)}
                    className="px-4 py-2 bg-panel hover:bg-panel/80 border border-gray-400 text-gray-200 font-tech text-xs cursor-pointer"
                  >
                    Open Editor [E]
                  </button>
                </div>
              </div>
            ) : (
              <div onClick={() => setEditorOpen(true)} className="font-tech text-white">
                Press <span className="text-warning font-bold">[E]</span> to Access Terminal
                {isGhost && <span className="ml-2 text-mafia text-xs font-bold">[GHOST / READ-ONLY]</span>}
                {currentPrivateTask && (
                  <div className="mt-1 font-mono text-xs text-primary">
                    Assigned: {currentPrivateTask.title}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 5. Mafia Escape Buffer Countdown (Top Center Banner) ── */}
      {isMafia && escapeBufferSeconds !== null && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto bg-[#FF003C] border-4 border-white px-6 py-3 shadow-[0_0_50px_#FF003C] animate-pulse flex items-center gap-4">
          <AlertTriangle size={32} className="text-yellow-300 animate-bounce" />
          <div className="text-center">
            <h4 className="font-pixel text-sm sm:text-base text-white tracking-wider">
              ESCAPE WINDOW ACTIVE!
            </h4>
            <p className="font-tech text-xs text-yellow-200 mt-0.5">
              You have <span className="font-bold text-white text-sm underline">{escapeBufferSeconds}s</span> to evacuate the room before the alarm triggers!
            </p>
          </div>
        </div>
      )}

      {/* ── 6. Mafia Live Notifications Tray (Bottom Left) ── */}
      {isMafia && mafiaNotifications.length > 0 && (
        <div className="fixed bottom-24 left-4 z-40 max-w-xs flex flex-col gap-2 pointer-events-auto">
          {mafiaNotifications.slice(0, 2).map((n) => (
            <div
              key={n.id}
              className="bg-black/95 border-2 border-yellow-500 p-3 shadow-[0_0_20px_rgba(255,184,0,0.4)] flex items-start gap-2.5 animate-in slide-in-from-left-4 duration-300 rounded-xs"
            >
              <Radio size={18} className="text-yellow-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <div className="font-pixel text-[10px] text-yellow-400 uppercase tracking-wider">
                  CREW ACTIVITY DETECTED
                </div>
                <div className="font-tech text-xs text-white mt-0.5 leading-tight">
                  {n.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 7. Bottom Left HUD: Emergency Call button ── */}
      <div className="flex justify-between items-end">
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

        <div className="pointer-events-auto" />
      </div>

      {/* ── 8. Room Editor Modal Overlay ── */}
      {editorOpen && interactableRoom && isCodingRoom(interactableRoom) && (
        <div className="pointer-events-auto">
          <RoomEditorModal
            roomId={interactableRoom}
            publicProject={publicProject}
            privateTask={currentPrivateTask}
            anonymousPresenceCount={otherPlayersCount}
            readOnly={isGhost}
            onClose={() => setEditorOpen(false)}
            onTaskPassed={(taskId, updatedCode) => {
              handleTaskPassed(taskId, updatedCode);
            }}
          />
        </div>
      )}

      {/* ── 9. Admin Facility Map Modal Overlay ── */}
      {mapOpen && <AdminMapModal onClose={() => setMapOpen(false)} />}

      {/* ── 10. Exit Game Confirmation Modal (Yes / No) ── */}
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
