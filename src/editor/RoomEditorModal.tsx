/**
 * RoomEditorModal.tsx — Strict Room Task Segregation Editor
 *
 * Self-contained modal overlay opened when a player presses [E] inside a coding room.
 *
 * Strict Room Task Segregation:
 *  - Each room has EXACTLY ONE task and ONE module file assigned.
 *  - Players in a room can ONLY view and edit the code for THAT specific room.
 *  - Multi-file browsing across rooms is strictly eliminated (no FileTree leakage).
 *  - Deterministic lexical validation (zero eval / zero arbitrary execution).
 *  - Read-only enforcement for eliminated ghosts.
 */

import { useState, useCallback, useEffect } from 'react';
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
}: RoomEditorModalProps) {
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

  // ── Single Scoped Code State (Only this room's code is ever loaded) ─────────
  const [code, setCode] = useState<string>(() => {
    return (
      privateTask?.sectionCode ??
      fallbackFile?.content ??
      fallbackTask?.initialCode ??
      ''
    );
  });

  // ── Test result state ────────────────────────────────────────────────────
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [hasRun, setHasRun] = useState(false);

  // Synchronize strictly to this room's code when privateTask or roomId changes
  useEffect(() => {
    const nextMapping = getRoomMapping(roomId);
    const nextFallbackTask = DEFAULT_TASKS.find((t) => t.id === nextMapping?.taskId);
    const nextFallbackFile = INITIAL_PROJECT_FILES.find(
      (f) => f.id === nextMapping?.fileId
    );

    setCode(
      privateTask?.sectionCode ??
        nextFallbackFile?.content ??
        nextFallbackTask?.initialCode ??
        ''
    );
    setTestResults([]);
    setHasRun(false);
  }, [roomId, privateTask]);

  // ── Derived status values ────────────────────────────────────────────────
  const allPassed = hasRun && testResults.length > 0 && testResults.every((r) => r.passed);
  const taskStatus =
    privateTask?.status ??
    (fallbackTask?.status === 'BUGGED'
      ? 'COMPROMISED'
      : fallbackTask?.status === 'COMPLETED' || allPassed
      ? 'COMPLETED'
      : 'IN_PROGRESS');

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCodeChange = useCallback((newValue: string) => {
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
      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center justify-between
                   bg-[#0D1426] border-b-4 border-[#1A233A] px-4 py-2"
      >
        {/* Left: room name + file name + presence */}
        <div className="flex items-center gap-4 min-w-0">
          <Terminal size={18} className="text-primary flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-pixel text-primary text-xs tracking-widest truncate">
              {roomLabel}
            </div>
            <div className="font-mono text-[11px] text-gray-400 truncate flex items-center gap-2">
              <span className="text-white font-bold">{fileName}</span>
              <span className="text-[10px] text-primary/80 font-pixel">
                [1 TASK ASSIGNED]
              </span>
              {readOnly && (
                <span className="ml-2 text-mafia font-bold">[READ ONLY]</span>
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

        {/* Right: Task status badge + Run Tests + Exit */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Status Badge */}
          <div className="font-mono text-xs px-2.5 py-1 border rounded border-[#1A233A]">
            {taskStatus === 'COMPLETED' && (
              <span className="text-success border-success bg-success/10 px-2 py-0.5 font-bold">
                ✓ COMPLETED
              </span>
            )}
            {taskStatus === 'COMPROMISED' && (
              <span className="text-mafia border-mafia bg-mafia/10 px-2 py-0.5 font-bold animate-pulse">
                ⚠ COMPROMISED
              </span>
            )}
            {taskStatus === 'IN_PROGRESS' && (
              <span className="text-warning border-warning bg-warning/10 px-2 py-0.5">
                IN PROGRESS
              </span>
            )}
            {taskStatus === 'ASSIGNED' && (
              <span className="text-primary border-primary bg-primary/10 px-2 py-0.5">
                ASSIGNED
              </span>
            )}
          </div>

          {taskId && !readOnly && (
            <button
              id="run-tests-btn"
              onClick={handleRunTests}
              className="flex items-center gap-2 border-2 border-success text-success font-pixel
                         text-[10px] px-4 py-2 hover:bg-success hover:text-black
                         transition-colors duration-150 tracking-widest cursor-pointer"
            >
              <Play size={12} />
              RUN TESTS
            </button>
          )}

          <button
            id="exit-terminal-btn"
            onClick={handleClose}
            className="flex items-center gap-2 border-2 border-mafia text-mafia font-pixel
                       text-[10px] px-4 py-2 hover:bg-mafia hover:text-black
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

      {/* ── Body: Task Workspace (Strictly Scoped to THIS Room Only) ──────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Side: Room Task Specification Sidebar (NO FileTree) */}
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

            {/* ── 2. 🔒 SCOPED ROOM TASK (Strictly 1 Task For This Room) ── */}
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
          </div>

          {/* Bottom Isolation Guarantee */}
          <div className="mt-3 pt-2.5 border-t border-[#1A233A] text-[9px] font-mono text-gray-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-success" />
              <span>ROOM TASK SEGREGATION</span>
            </div>
            <span className="text-success font-bold font-pixel text-[9px]">
              1 TASK ACTIVE
            </span>
          </div>
        </aside>

        {/* Monaco Editor Panel: Scoped Module Code Only */}
        <div className="flex-1 overflow-hidden min-w-0 flex flex-col">
          <div className="bg-[#0D1426] border-b border-[#1A233A] px-3 py-1.5 text-[10px] font-mono text-gray-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Code2 size={13} className="text-primary" />
              <span className="text-white font-bold">{fileName}</span>
              <span className="text-gray-500">//</span>
              <span className="text-primary font-pixel text-[9px]">
                {roomLabel} WORKSPACE
              </span>
            </div>
            <span className="text-gray-500 text-[9px]">
              SOLVE THIS ROOM'S TASK TO RESTORE INTEGRITY
            </span>
          </div>

          <CodeEditor
            key={`${roomId}-${taskId}`}
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
            readOnly={readOnly}
            onChange={handleCodeChange}
            height="100%"
          />
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
            {taskStatus === 'COMPROMISED' ? (
              <span className="text-mafia font-bold animate-pulse flex items-center gap-1.5">
                <AlertTriangle size={14} />
                ⚠ CODE COMPROMISED — The logic in this room was sabotaged. Review and repair.
              </span>
            ) : taskStatus === 'COMPLETED' ? (
              <span className="text-success font-bold flex items-center gap-1.5">
                <CheckCircle size={14} />
                ✓ ROOM TASK COMPLETED — System stability restored in {roomLabel}.
              </span>
            ) : taskId ? (
              <span>
                Edit the logic in <span className="text-primary font-bold">{fileName}</span> above, then click <span className="text-success font-bold">RUN TESTS</span>.
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
                ✓ TASK COMPLETED — AUTHORITATIVE PROGRESS UPDATED
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}

export default RoomEditorModal;
