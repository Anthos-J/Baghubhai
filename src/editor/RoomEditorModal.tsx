/**
 * RoomEditorModal.tsx — Strict Room Task Segregation Editor with Supabase Shared Code & Imposter Sabotage
 *
 * Architecture:
 * - Supabase is the persistent source of truth for the shared code in this room.
 * - Monotonically increasing versioning (v1, v2, v3... v10 -> v11).
 * - Crewmate save with optimistic stale-save protection (rejects overwrite if expectedVersion < latestVersion).
 * - Mafia sabotage: ALWAYS fetches the latest authoritative version from Supabase before mutating.
 * - Realtime notification: updates active clients with loop guard (applyingRemoteChange).
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  X,
  Play,
  CheckCircle,
  XCircle,
  LogOut,
  Terminal,
  ShieldAlert,
  AlertTriangle,
  Users,
  Globe,
  Lock,
  Code2,
  ShieldCheck,
  FileCode,
  Bug,
  Save,
  RefreshCw,
} from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { INITIAL_PROJECT_FILES } from './predefinedProject';
import { DEFAULT_TASKS } from '../game/tasks';
import { runTaskTests, TestResult } from './testRunner';
import { getRoomMapping } from './roomMapping';
import {
  PrivatePlayerTask,
  PublicProjectContext,
  PUBLIC_PROJECT_CONTEXT,
  validatePrivateTaskCode,
} from './privateTasks';
import { useMockStore } from '../store/mockStore';
import {
  fetchLatestSharedFile,
  saveCrewmateCode,
  sabotageSharedCode,
} from '../services/sharedCodeService';
import { logGameEvent } from '../services/eventLogger';
import { supabase } from '../lib/supabase';

// ---------------------------------------------------------------------------
// Public Props
// ---------------------------------------------------------------------------

export interface RoomEditorModalProps {
  /** The room identifier — accepts both MapData id ('library') and display name ('LIBRARY & ARCHIVES') */
  roomId: string;
  /** Called when the player clicks EXIT TERMINAL */
  onClose: () => void;
  /**
   * Optional: called when all deterministic tests for the room's task pass.
   * Receives the taskId so the authoritative game engine records completion.
   */
  onTaskPassed?: (taskId: string, updatedCode?: string) => void;
  /**
   * When true, Monaco is read-only (Ghost / spectator mode).
   */
  readOnly?: boolean;
  /**
   * Optional: Public project metadata visible to all players.
   */
  publicProject?: PublicProjectContext;
  /**
   * Optional: Player's private assigned task for this room.
   */
  privateTask?: PrivatePlayerTask | null;
  /**
   * Optional: Anonymous count of other players currently at this terminal/file.
   */
  anonymousPresenceCount?: number;
  /**
   * Imposter integration props
   */
  isMafia?: boolean;
  completedCode?: string;
  roomTaskStatus?: 'PENDING' | 'COMPLETED' | 'BUGGED';
  canBug?: boolean;
  onBugTask?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RoomEditorModal({
  roomId,
  onClose,
  onTaskPassed,
  readOnly = false,
  publicProject = PUBLIC_PROJECT_CONTEXT,
  privateTask = null,
  anonymousPresenceCount = 0,
  isMafia = false,
  completedCode,
  roomTaskStatus,
  canBug = false,
  onBugTask,
}: RoomEditorModalProps) {
  const store = useMockStore();
  const gameId = store.roomId || store.session?.roomId || 'local-game';
  const playerId = store.session?.playerId || (store.players[0]?.id ?? 'player-1');

  // ── Resolve mapping & fallback room definitions ────────────────────────────
  const mapping = getRoomMapping(roomId);
  const fallbackTask = DEFAULT_TASKS.find((t) => t.id === mapping?.taskId);
  const fallbackFile = INITIAL_PROJECT_FILES.find((f) => f.id === mapping?.fileId);

  // Authoritative task identifiers strictly scoped to this room
  const taskId = privateTask?.taskId ?? mapping?.taskId ?? fallbackTask?.id ?? null;
  const fileName =
    privateTask?.fileName ??
    fallbackFile?.name ??
    fallbackTask?.fileName ??
    (mapping ? `${mapping.fileId.replace('file-', '')}.js` : 'module.js');
  const roomLabel = privateTask?.roomLabel ?? mapping?.roomLabel ?? roomId.toUpperCase();
  const taskTitle =
    privateTask?.title ?? fallbackTask?.title ?? 'Room Diagnostic Module';
  const taskDescription =
    privateTask?.description ??
    fallbackTask?.description ??
    fallbackFile?.description ??
    'Debug and repair the code module defect in this room terminal.';
  const taskHint = privateTask?.hint ?? fallbackTask?.hint ?? '';

  const isCompletedByCrew = roomTaskStatus === 'COMPLETED';

  // ── Code & Version State ──────────────────────────────────────────────────
  const [code, setCode] = useState<string>(() => {
    if (completedCode && (isMafia || isCompletedByCrew || privateTask?.status === 'COMPLETED')) {
      return completedCode;
    }
    return (
      privateTask?.sectionCode ??
      fallbackFile?.content ??
      fallbackTask?.initialCode ??
      ''
    );
  });

  const [version, setVersion] = useState<number>(1);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [staleConflict, setStaleConflict] = useState<{ currentVersion: number; serverCode: string } | null>(null);
  const [remoteUpdateNotice, setRemoteUpdateNotice] = useState<{ newVersion: number } | null>(null);

  // ── Test result state ────────────────────────────────────────────────────
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [hasRun, setHasRun] = useState(false);

  // Guard refs
  const applyingRemoteChangeRef = useRef<boolean>(false);
  const lastLoadedCodeRef = useRef<string>(code);

  // ── 1. Fetch Latest Authoritative Code & Version on Open ──────────────────
  useEffect(() => {
    let isMounted = true;
    setIsLoadingFile(true);
    setStaleConflict(null);
    setRemoteUpdateNotice(null);

    fetchLatestSharedFile(gameId, roomId)
      .then((file) => {
        if (!isMounted) return;
        applyingRemoteChangeRef.current = true;
        setCode(file.content);
        setVersion(file.version);
        lastLoadedCodeRef.current = file.content;
        setIsLoadingFile(false);
        applyingRemoteChangeRef.current = false;

        // Log FILE_OPENED event
        logGameEvent({
          gameId,
          type: 'FILE_OPENED',
          playerId,
          roomId,
          fileId: file.id,
          fileName: file.file_name,
          newVersion: file.version,
        });
      })
      .catch((err) => {
        console.warn('Could not fetch latest shared file from Supabase, using local fallback:', err);
        if (isMounted) {
          setIsLoadingFile(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [gameId, roomId, playerId]);

  // ── 2. Realtime Notification for Live File Changes ────────────────────────
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase.channel(`room:${gameId}:events`);

    channel.on('broadcast', { event: 'file_code_updated' }, ({ payload }) => {
      if (!payload) return;
      const targetRoom = payload.roomId?.toLowerCase();
      const currentRoomNorm = (mapping?.fileId.replace('file-', '') || roomId).toLowerCase();

      if (targetRoom === currentRoomNorm || payload.fileName === fileName) {
        const newVer = Number(payload.version || 1);

        // If local user has NO unsaved modifications, automatically update editor
        if (code === lastLoadedCodeRef.current) {
          fetchLatestSharedFile(gameId, roomId).then((file) => {
            applyingRemoteChangeRef.current = true;
            setCode(file.content);
            setVersion(file.version);
            lastLoadedCodeRef.current = file.content;
            applyingRemoteChangeRef.current = false;
          });
        } else {
          // If local user has pending unsaved changes, display warning notification banner
          setRemoteUpdateNotice({ newVersion: newVer });
        }
      }
    });

    return () => {
      // Channel lifecycle managed in useRealtime / store
    };
  }, [gameId, roomId, fileName, mapping, code]);

  // Keyboard shortcut: 'B' to bug code inside terminal if Imposter
  useEffect(() => {
    const handleModalKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key.toLowerCase() === 'b' && canBug) {
        e.preventDefault();
        handleSabotageAction();
      }
    };
    window.addEventListener('keydown', handleModalKey);
    return () => window.removeEventListener('keydown', handleModalKey);
  }, [canBug]);

  // ── Derived status values ────────────────────────────────────────────────
  const allPassed = hasRun && testResults.length > 0 && testResults.every((r) => r.passed);
  const taskStatus =
    isCompletedByCrew
      ? 'COMPLETED'
      : roomTaskStatus === 'BUGGED'
      ? 'COMPROMISED'
      : privateTask?.status ??
        (fallbackTask?.status === 'BUGGED'
          ? 'COMPROMISED'
          : fallbackTask?.status === 'COMPLETED' || allPassed
          ? 'COMPLETED'
          : 'IN_PROGRESS');

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCodeChange = useCallback((newValue: string) => {
    if (applyingRemoteChangeRef.current) return;
    setCode(newValue);
    setHasRun(false);
    setTestResults([]);
  }, []);

  const handleRunTests = useCallback(() => {
    if (!taskId) return;

    let results: TestResult[] = [];
    if (privateTask) {
      results = validatePrivateTaskCode(taskId, code);
    } else {
      const roomFileId = mapping?.fileId ?? 'file-auth';
      results = runTaskTests(
        [{ id: roomFileId, name: fileName, language: 'javascript', content: code }],
        taskId
      );
    }

    setTestResults(results);
    setHasRun(true);

    if (results.length > 0 && results.every((r) => r.passed)) {
      onTaskPassed?.(taskId, code);
    }
  }, [taskId, privateTask, code, mapping, fileName, onTaskPassed]);

  // ── Explicit Save / Submit Handler (Supabase Persistence with Stale Check) ──
  const handleSaveAndSubmit = async () => {
    if (isSaving || readOnly) return;
    setIsSaving(true);
    setStaleConflict(null);

    // 1. Run deterministic test validation first
    let passed = false;
    if (taskId) {
      const results = privateTask
        ? validatePrivateTaskCode(taskId, code)
        : runTaskTests(
            [{ id: mapping?.fileId ?? 'file-auth', name: fileName, language: 'javascript', content: code }],
            taskId
          );
      setTestResults(results);
      setHasRun(true);
      passed = results.length > 0 && results.every((r) => r.passed);
    }

    // 2. Persist code to Supabase with optimistic version check
    const res = await saveCrewmateCode({
      gameId,
      roomIdOrFileId: roomId,
      content: code,
      expectedVersion: version,
      playerId,
    });

    setIsSaving(false);

    if (res.stale) {
      // Stale Save Rejected: Show warning & let user load latest
      setStaleConflict({
        currentVersion: res.currentVersion || version + 1,
        serverCode: res.file?.content || '',
      });
      logGameEvent({
        gameId,
        type: 'STALE_CODE_SUBMITTED',
        playerId,
        roomId,
        previousVersion: version,
        newVersion: res.currentVersion,
      });
      return;
    }

    if (res.success && res.file) {
      setVersion(res.file.version);
      lastLoadedCodeRef.current = res.file.content;
      setRemoteUpdateNotice(null);

      // Log successful file update & task completion
      logGameEvent({
        gameId,
        type: passed ? 'TASK_COMPLETED' : 'FILE_CODE_UPDATED',
        playerId,
        roomId,
        fileId: res.file.id,
        fileName: res.file.file_name,
        previousVersion: version,
        newVersion: res.file.version,
      });

      if (passed && taskId) {
        onTaskPassed?.(taskId, code);
      }
    }
  };

  // ── Imposter Sabotage Handler (Always Mutates Latest Supabase Code) ────────
  const handleSabotageAction = async () => {
    if (isSaving) return;
    setIsSaving(true);

    // If Mafia manually typed changes, use custom code, otherwise controlled mutation
    const hasCustomEdits = code !== lastLoadedCodeRef.current;

    const res = await sabotageSharedCode({
      gameId,
      roomIdOrFileId: roomId,
      playerId,
      customMutatedCode: hasCustomEdits ? code : undefined,
    });

    setIsSaving(false);

    if (res.success && res.file) {
      applyingRemoteChangeRef.current = true;
      setCode(res.file.content);
      setVersion(res.file.version);
      lastLoadedCodeRef.current = res.file.content;
      applyingRemoteChangeRef.current = false;

      // Log BUG_INJECTED event
      logGameEvent({
        gameId,
        type: 'BUG_INJECTED',
        playerId,
        roomId,
        fileId: res.file.id,
        fileName: res.file.file_name,
        previousVersion: res.previousVersion,
        newVersion: res.newVersion,
        mutationType: res.mutationType,
      });

      if (onBugTask) {
        onBugTask();
      }
    }
  };

  const handleLoadLatest = async () => {
    setIsLoadingFile(true);
    const latest = await fetchLatestSharedFile(gameId, roomId);
    applyingRemoteChangeRef.current = true;
    setCode(latest.content);
    setVersion(latest.version);
    lastLoadedCodeRef.current = latest.content;
    setStaleConflict(null);
    setRemoteUpdateNotice(null);
    setIsLoadingFile(false);
    applyingRemoteChangeRef.current = false;
  };

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // ── Unknown room guard ───────────────────────────────────────────────────
  if (!mapping && !privateTask) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="bg-[#0D1426] border-4 border-mafia p-8 max-w-sm text-center shadow-[0_0_40px_rgba(255,0,60,0.4)]">
          <ShieldAlert size={40} className="text-mafia mx-auto mb-4 animate-pulse" />
          <div className="font-pixel text-mafia text-lg mb-2">TERMINAL ERROR</div>
          <div className="font-mono text-sm text-gray-400 mb-6">
            No coding terminal found for:<br />
            <span className="text-warning">{roomId}</span>
          </div>
          <button
            onClick={handleClose}
            className="w-full border-2 border-primary text-primary font-pixel text-sm px-6 py-3
                       hover:bg-primary hover:text-black transition-colors duration-150 cursor-pointer"
          >
            EXIT
          </button>
        </div>
      </div>
    );
  }

  // ── Main Modal ───────────────────────────────────────────────────────────
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col bg-[#070B16] border-4 border-primary
                 shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden"
    >
      {/* ── Stale Save Warning Alert Banner ────────────────────────────── */}
      {staleConflict && (
        <div className="bg-mafia/90 text-white border-b-2 border-white px-4 py-2 flex items-center justify-between z-50 animate-bounce">
          <div className="flex items-center gap-2 font-mono text-xs">
            <AlertTriangle size={16} className="text-yellow-300" />
            <span>
              <strong>⚠ NEWER VERSION EXISTS!</strong> Another player has already saved a newer version (Your version: v{version}, Latest: v{staleConflict.currentVersion}).
            </span>
          </div>
          <button
            onClick={handleLoadLatest}
            className="flex items-center gap-1.5 px-3 py-1 bg-black border border-white text-white font-pixel text-[10px] hover:bg-white hover:text-black transition-colors cursor-pointer"
          >
            <RefreshCw size={12} />
            LOAD LATEST (v{staleConflict.currentVersion})
          </button>
        </div>
      )}

      {/* ── Remote Update Notification Banner ──────────────────────────── */}
      {remoteUpdateNotice && !staleConflict && (
        <div className="bg-yellow-950/90 text-yellow-300 border-b-2 border-yellow-500 px-4 py-2 flex items-center justify-between z-50">
          <div className="flex items-center gap-2 font-mono text-xs">
            <AlertTriangle size={16} className="text-yellow-400 animate-pulse" />
            <span>
              <strong>⚠ FILE UPDATED!</strong> Another player has saved changes to this file (Latest: v{remoteUpdateNotice.newVersion}).
            </span>
          </div>
          <button
            onClick={handleLoadLatest}
            className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500 text-black font-pixel text-[10px] hover:bg-yellow-400 transition-colors cursor-pointer font-bold"
          >
            <RefreshCw size={12} />
            LOAD LATEST (v{remoteUpdateNotice.newVersion})
          </button>
        </div>
      )}

      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center justify-between
                   bg-[#0D1426] border-b-4 border-[#1A233A] px-4 py-2"
      >
        {/* Left: room name + file name + version + presence */}
        <div className="flex items-center gap-4 min-w-0">
          <Terminal size={18} className="text-primary flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-pixel text-primary text-xs tracking-widest truncate">
              {roomLabel}
            </div>
            <div className="font-mono text-[11px] text-gray-400 truncate flex items-center gap-2">
              <span className="text-white font-bold">{fileName}</span>
              <span className="text-[10px] text-primary border border-primary/40 bg-primary/10 px-1.5 py-0.2 rounded font-pixel font-bold">
                v{version}
              </span>
              <span className="text-[10px] text-primary/80 font-pixel">
                [1 TASK ASSIGNED]
              </span>
              {readOnly && (
                <span className="ml-2 text-mafia font-bold">[READ ONLY]</span>
              )}
              {isMafia && isCompletedByCrew && (
                <span className="ml-2 text-yellow-400 font-bold font-mono text-[10px] animate-pulse">
                  [CREWMATE SOLVED CODE]
                </span>
              )}
            </div>
          </div>

          {/* Anonymous Presence Counter */}
          {anonymousPresenceCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-warning/10 border border-warning/40 text-warning font-mono text-[11px] rounded">
              <Users size={12} />
              <span>
                {anonymousPresenceCount} OTHER DEVELOPER
                {anonymousPresenceCount > 1 ? 'S' : ''} AT TERMINAL
              </span>
            </div>
          )}
        </div>

        {/* Right: Task status badge + Imposter Bug Button / Save & Run Tests + Exit */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Status Badge */}
          <div className="font-mono text-xs px-2.5 py-1 border rounded border-[#1A233A]">
            {canBug ? (
              <span className="text-yellow-400 border border-yellow-500 bg-yellow-950/80 px-2 py-0.5 font-bold animate-pulse flex items-center gap-1">
                <Bug size={11} /> READY TO BUG
              </span>
            ) : taskStatus === 'COMPLETED' ? (
              <span className="text-success border-success bg-success/10 px-2 py-0.5 font-bold">
                ✓ COMPLETED
              </span>
            ) : taskStatus === 'COMPROMISED' ? (
              <span className="text-mafia border-mafia bg-mafia/10 px-2 py-0.5 font-bold animate-pulse">
                ⚠ COMPROMISED
              </span>
            ) : taskStatus === 'IN_PROGRESS' ? (
              <span className="text-warning border-warning bg-warning/10 px-2 py-0.5">
                IN PROGRESS
              </span>
            ) : (
              <span className="text-primary border-primary bg-primary/10 px-2 py-0.5">
                ASSIGNED
              </span>
            )}
          </div>

          {/* Imposter Bug Action Button */}
          {canBug && (
            <button
              id="bug-task-modal-btn"
              onClick={handleSabotageAction}
              disabled={isSaving}
              className="flex items-center gap-2 border-2 border-mafia bg-mafia text-white font-pixel
                         text-[10px] px-4 py-2 hover:bg-mafia/80 shadow-[0_0_20px_#FF003C]
                         transition-all hover:scale-105 duration-150 tracking-widest cursor-pointer animate-pulse"
              title="Bug this code and trigger 3-second escape window [B]"
            >
              <Bug size={13} />
              {isSaving ? 'SABOTAGING...' : 'BUG THIS CODE [B]'}
            </button>
          )}

          {/* Developer Run Tests Button */}
          {taskId && !readOnly && !isMafia && (
            <button
              id="run-tests-btn"
              onClick={handleRunTests}
              className="flex items-center gap-1.5 border border-panelBorder bg-panel text-gray-200 font-pixel
                         text-[10px] px-3 py-2 hover:border-primary hover:text-primary
                         transition-colors duration-150 tracking-wider cursor-pointer"
            >
              <Play size={12} className="text-success" />
              RUN TESTS
            </button>
          )}

          {/* Developer Save / Submit Button */}
          {!readOnly && !isMafia && (
            <button
              id="save-code-btn"
              onClick={handleSaveAndSubmit}
              disabled={isSaving}
              className="flex items-center gap-1.5 border-2 border-success bg-success/10 text-success font-pixel
                         text-[10px] px-4 py-2 hover:bg-success hover:text-black
                         transition-all hover:scale-105 duration-150 tracking-widest cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.3)]"
            >
              <Save size={12} />
              {isSaving ? 'SAVING...' : 'SAVE & SUBMIT'}
            </button>
          )}

          <button
            id="exit-terminal-btn"
            onClick={handleClose}
            className="flex items-center gap-2 border-2 border-mafia text-mafia font-pixel
                       text-[10px] px-3.5 py-2 hover:bg-mafia hover:text-black
                       transition-colors duration-150 tracking-widest cursor-pointer"
          >
            <LogOut size={12} />
            EXIT
          </button>
          <button
            onClick={handleClose}
            className="p-1 text-gray-500 hover:text-white transition-colors cursor-pointer"
            aria-label="Close editor"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* ── Body: Task Workspace ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Side: Room Task Specification Sidebar */}
        <aside className="flex-shrink-0 w-80 bg-[#0A0F1D] border-r-4 border-[#1A233A] p-3.5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3.5">
            {/* ── 1. PUBLIC PROJECT CONTEXT ── */}
            <div className="bg-[#0D1426] border border-primary/30 p-2.5 rounded shadow-sm">
              <div className="flex items-center gap-1.5 text-primary font-pixel text-[10px] tracking-wider mb-1">
                <Globe size={12} />
                <span>FACILITY SYSTEM CONTEXT</span>
              </div>
              <div className="font-tech text-white font-bold text-xs">
                {publicProject?.title ?? 'SPACE STATION CORE SERVICES'}
              </div>
              <p className="font-mono text-[10px] text-gray-400 mt-1 leading-relaxed">
                {publicProject?.description}
              </p>
            </div>

            {/* ── 2. SCOPED ROOM TASK OR MAFIA SABOTAGE SPECIFICATION ── */}
            {isMafia && isCompletedByCrew ? (
              <div className="bg-[#18080C] border-2 border-mafia p-3 rounded space-y-2.5 shadow-[0_0_25px_rgba(255,0,60,0.25)]">
                <div className="flex items-center justify-between border-b border-mafia/40 pb-1.5">
                  <div className="flex items-center gap-1.5 font-pixel text-[10px] text-mafia tracking-widest animate-pulse">
                    <Bug size={13} className="text-mafia" />
                    <span>SABOTAGE TARGET</span>
                  </div>
                  <span className="font-pixel text-[9px] text-yellow-400 bg-yellow-950/80 px-1.5 py-0.5 border border-yellow-500">
                    CREWMATE CODE
                  </span>
                </div>

                <div>
                  <div className="font-tech text-white font-bold text-sm leading-snug">
                    {taskTitle}
                  </div>
                  <p className="font-mono text-[11px] text-gray-300 leading-relaxed mt-1">
                    Crewmates have completed and deployed this module! The latest working code is displayed in the editor.
                  </p>
                </div>

                <div className="p-2.5 bg-black/80 border border-mafia/40 rounded text-[10px] font-mono text-yellow-300 space-y-1">
                  <div className="font-pixel text-[9px] text-mafia uppercase">ESCAPE WINDOW NOTICE</div>
                  <div>
                    Click <strong className="text-white font-bold">BUG THIS CODE [B]</strong> to sabotage the logic. You will have a <span className="underline font-bold text-white">3-second window</span> to evacuate before the hazard alarm sounds!
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#070B16] border-2 border-[#1A233A] p-3 rounded space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#1A233A] pb-1.5">
                  <div className="flex items-center gap-1.5 font-pixel text-[10px] text-primary tracking-widest">
                    <Lock size={12} className="text-primary" />
                    <span>ROOM TASK</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-success bg-success/10 px-1.5 py-0.5 border border-success/30 rounded">
                    <FileCode size={11} />
                    <span>{fileName}</span>
                  </div>
                </div>

                <div>
                  <div className="font-tech text-white font-bold text-sm leading-snug">
                    {taskTitle}
                  </div>
                  <p className="font-mono text-[11px] text-gray-300 leading-relaxed mt-1">
                    {taskDescription}
                  </p>
                </div>

                {taskHint && (
                  <div className="p-2.5 bg-[#0D1426] border border-warning/40 rounded">
                    <div className="font-pixel text-[9px] text-warning mb-0.5">
                      EXPECTED BEHAVIOR / HINT
                    </div>
                    <div className="font-mono text-[10px] text-gray-300 leading-relaxed">
                      {taskHint}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Isolation Guarantee */}
          <div className="mt-3 pt-2.5 border-t border-[#1A233A] text-[9px] font-mono text-gray-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-success" />
              <span>SUPABASE PERSISTENCE ACTIVE</span>
            </div>
            <span className="text-success font-bold font-pixel text-[9px]">
              VERSION {version}
            </span>
          </div>
        </aside>

        {/* Monaco Editor Panel: Scoped Module Code Only */}
        <div className="flex-1 overflow-hidden min-w-0 flex flex-col">
          <div className="bg-[#0D1426] border-b border-[#1A233A] px-3 py-1.5 text-[10px] font-mono text-gray-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Code2 size={13} className="text-primary" />
              <span className="text-white font-bold">{fileName}</span>
              <span className="text-primary font-pixel text-[9px]">
                [VERSION {version}]
              </span>
              <span className="text-gray-500">//</span>
              <span className="text-primary font-pixel text-[9px]">
                {roomLabel} WORKSPACE
              </span>
            </div>
            <span className="text-gray-500 text-[9px]">
              {isMafia && isCompletedByCrew
                ? 'LATEST CREWMATE LOGIC LOADED — READY FOR SABOTAGE'
                : "EDIT AND CLICK 'SAVE & SUBMIT' TO PERSIST CODE"}
            </span>
          </div>

          {isLoadingFile ? (
            <div className="flex items-center justify-center flex-1 bg-[#070B16] text-primary font-tech animate-pulse text-sm">
              &gt; FETCHING LATEST CODE FROM SUPABASE (ROOM: {roomLabel})...
            </div>
          ) : (
            <CodeEditor
              key={`${roomId}-${taskId}-${version}`}
              value={code}
              language={
                fileName.endsWith('.java')
                  ? 'java'
                  : fileName.endsWith('.py')
                  ? 'python'
                  : fileName.endsWith('.c') || fileName.endsWith('.cpp')
                  ? 'cpp'
                  : 'javascript'
              }
              readOnly={readOnly || (isMafia && isCompletedByCrew)}
              onChange={handleCodeChange}
              height="100%"
            />
          )}
        </div>
      </div>

      {/* ── Test Results panel ──────────────────────────────────────────── */}
      <footer
        className="flex-shrink-0 border-t-4 border-[#1A233A] bg-[#0D1426]
                   px-4 py-3 min-h-[85px] max-h-44 overflow-y-auto"
      >
        {!hasRun && (
          <div className="font-mono text-xs text-gray-500 h-full flex items-center gap-2">
            <Terminal size={14} className="text-gray-600" />
            {isMafia && isCompletedByCrew ? (
              <span className="text-yellow-400 font-mono text-xs flex items-center gap-2 animate-pulse">
                <Bug size={14} className="text-yellow-400 flex-shrink-0" />
                <span>
                  Crewmate solved code loaded in <strong className="text-white">{fileName} (v{version})</strong>. Click <strong className="text-white underline">BUG THIS CODE [B]</strong> to sabotage the module (3s escape window before hazard alarm triggers)!
                </span>
              </span>
            ) : taskStatus === 'COMPROMISED' ? (
              <span className="text-mafia font-bold animate-pulse flex items-center gap-1.5">
                <AlertTriangle size={14} />
                ⚠ CODE COMPROMISED — The logic in this room was sabotaged. Review and repair.
              </span>
            ) : taskStatus === 'COMPLETED' ? (
              <span className="text-success font-bold flex items-center gap-1.5">
                <CheckCircle size={14} />
                ✓ ROOM TASK COMPLETED — System stability restored in {roomLabel} (v{version}).
              </span>
            ) : taskId ? (
              <span>
                Edit the logic in <span className="text-primary font-bold">{fileName}</span> above, then click <span className="text-success font-bold">SAVE & SUBMIT</span> or <span className="text-gray-300 font-bold">RUN TESTS</span>.
              </span>
            ) : (
              'This room has no task associated.'
            )}
          </div>
        )}

        {hasRun && testResults.length === 0 && (
          <div className="font-mono text-xs text-warning">No tests returned.</div>
        )}

        {hasRun && testResults.length > 0 && (
          <div className="space-y-1.5">
            <div
              className={`font-pixel text-xs tracking-widest mb-2 ${
                allPassed ? 'text-success' : 'text-mafia'
              }`}
            >
              {allPassed
                ? '▶ ALL TESTS PASSED — ROOM TASK COMPLETED'
                : '▶ TEST FAILED — REVIEW CODE'}
            </div>

            {testResults.map((result) => (
              <div
                key={result.testId}
                className={`flex items-start gap-2 font-mono text-xs border-l-2 pl-3 py-0.5 ${
                  result.passed
                    ? 'border-success text-gray-300'
                    : 'border-mafia text-gray-400'
                }`}
              >
                <span className="flex-shrink-0 mt-0.5">
                  {result.passed ? (
                    <CheckCircle size={12} className="text-success" />
                  ) : (
                    <XCircle size={12} className="text-mafia" />
                  )}
                </span>
                <span className="leading-relaxed">{result.message}</span>
              </div>
            ))}

            {allPassed && (
              <div
                className="mt-2 font-pixel text-[10px] text-success border-2 border-success
                           inline-block px-3 py-1 shadow-[0_0_12px_rgba(0,255,0,0.4)]
                           animate-pulse"
              >
                ✓ TASK COMPLETED — AUTHORITATIVE PROGRESS UPDATED (v{version})
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}

export default RoomEditorModal;
